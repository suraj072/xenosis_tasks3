import React from "react";
import { useLocation } from "react-router-dom";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Load your Stripe public key
const stripePromise = loadStripe("your-public-key-here");

const CheckoutForm = () => {
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  // Retrieve cart items from location state
  const cartItems = location.state?.cartItems || [];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Create payment method using Stripe
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
    } else {
      try {
        // Call backend API to create payment intent and confirm payment
        const response = await fetch("/api/payments/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: calculateTotalAmount(cartItems) }),
        });

        const { clientSecret } = await response.json();

        // Confirm the payment with the client secret
        const { error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: paymentMethod.id,
          }
        );

        if (confirmError) {
          setError(confirmError.message);
        } else {
          setSuccess(true);
          // Optionally navigate to order confirmation page or handle order completion
        }
      } catch (err) {
        setError("An error occurred during payment processing.");
      }
    }
  };

  // Calculate total amount from cart items
  const calculateTotalAmount = (items) => {
    return (
      items.reduce((total, item) => total + item.price * item.quantity, 0) * 100
    ); // Stripe requires amount in cents
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Checkout</h2>
      {cartItems.length > 0 ? (
        <div>
          <h3>Items in your cart:</h3>
          {cartItems.map((item) => (
            <div key={item.id}>
              <p>
                {item.name} - ${item.price} x {item.quantity}
              </p>
            </div>
          ))}
          <h3>Total: ${calculateTotalAmount(cartItems) / 100}</h3>
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
      {error && <p>{error}</p>}
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
      {success && <p>Payment successful!</p>}
    </form>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
