from fastapi import APIRouter, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db, User
import stripe
import os

router = APIRouter(prefix="/api/payment", tags=["payment"])

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

PRICE_ID = "price_1234567890"  # TODO: Create in Stripe Dashboard

@router.post("/create-checkout")
async def create_checkout(email: str, db: Session = Depends(get_db)):
    """Create Stripe Checkout session for €49 one-time payment"""
    
    # Create or get user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        from uuid import uuid4
        user = User(id=str(uuid4()), email=email)
        db.add(user)
        db.commit()
    
    # Create Stripe Checkout session
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': 'Hunt-X Lifetime Access',
                        'description': 'Unlimited CV generations, AI resume analysis, application tracker'
                    },
                    'unit_amount': 4900,  # €49.00 in cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='https://careerpilot.app/dashboard?payment=success',
            cancel_url='https://careerpilot.app/?payment=cancelled',
            customer_email=email,
            metadata={'user_id': user.id}
        )
        
        return {"checkout_url": session.url, "session_id": session.id}
    
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook for payment confirmation"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(400, "Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")
    
    # Handle successful payment
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata'].get('user_id')
        
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.stripe_payment_status = 'completed'
            user.stripe_customer_id = session.get('customer')
            db.commit()
    
    return {"status": "success"}

@router.get("/status/{email}")
async def check_payment_status(email: str, db: Session = Depends(get_db)):
    """Check if user has paid"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"paid": False}
    
    return {"paid": user.stripe_payment_status == 'completed'}
