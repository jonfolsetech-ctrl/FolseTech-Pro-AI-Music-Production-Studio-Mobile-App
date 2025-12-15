const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

const handleCheckoutCompleted = async (session) => {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription;

  if (userId && subscriptionId) {
    try {
      const db = admin.firestore();
      await db.collection('users').doc(userId).update({
        subscriptionId,
        subscriptionStatus: 'active',
        plan: session.metadata?.plan || 'pro',
        subscribedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Subscription activated for user ${userId}`);
    } catch (error) {
      console.error('Error updating user subscription:', error);
    }
  }
};

const handleSubscriptionUpdate = async (subscription) => {
  try {
    const db = admin.firestore();
    const userSnapshot = await db.collection('users')
      .where('subscriptionId', '==', subscription.id)
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      await userDoc.ref.update({
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });

      console.log(`Subscription updated for ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  try {
    const db = admin.firestore();
    const userSnapshot = await db.collection('users')
      .where('subscriptionId', '==', subscription.id)
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      await userDoc.ref.update({
        subscriptionStatus: 'canceled',
        plan: 'free',
        canceledAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Subscription canceled for ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
  }
};

const handlePaymentSuccess = async (paymentIntent) => {
  console.log('Payment succeeded:', paymentIntent.id);
  // Add custom logic for successful payments
};

const handlePaymentFailed = async (paymentIntent) => {
  console.error('Payment failed:', paymentIntent.id);
  // Add custom logic for failed payments (e.g., notify user)
};

module.exports = {
  handleWebhook
};
