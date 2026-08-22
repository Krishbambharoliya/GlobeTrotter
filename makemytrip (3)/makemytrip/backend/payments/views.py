from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment
from .serializers import PaymentSerializer
from bookings.models import Booking
from decimal import Decimal
import uuid

class AddWalletMoneyView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        amount = request.data.get('amount')
        method = request.data.get('method', 'UPI')
        upi_id = request.data.get('upi_id', '')

        try:
            amount_val = float(amount)
            if amount_val <= 0:
                return Response({"error": "Invalid top-up amount"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Please enter a valid numeric amount"}, status=status.HTTP_400_BAD_REQUEST)

        profile = request.user.profile
        profile.wallet_balance += Decimal(str(amount_val))
        profile.save()

        return Response({
            "message": f"Successfully added ₹{amount_val} to your Wallet!",
            "new_wallet_balance": float(profile.wallet_balance)
        })

class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Payment.objects.filter(booking__user=self.request.user).order_by('-created_at')

class CreateMockPaymentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        booking_id = request.data.get('booking_id')
        method = request.data.get('method', 'UPI') # UPI, Card, NetBanking, Wallet
        
        try:
            booking = Booking.objects.get(pk=booking_id, user=request.user)
            amount = booking.total_price
            profile = request.user.profile
            
            # If Wallet is chosen, check and deduct balance
            if method == 'Wallet':
                if profile.wallet_balance < amount:
                    return Response({"error": f"Insufficient wallet balance. Available: ₹{float(profile.wallet_balance)}, Required: ₹{float(amount)}"}, status=status.HTTP_400_BAD_REQUEST)
                profile.wallet_balance -= amount
                profile.save()
                
            # Create payment record
            payment = Payment.objects.create(
                booking=booking,
                payment_id=f"PAY-{uuid.uuid4().hex[:10].upper()}",
                amount=amount,
                status='completed',
                method=method
            )
            
            # Confirm booking
            booking.status = 'confirmed'
            booking.save()

            # Reserve train seats in database
            if booking.booking_type == 'train' and getattr(booking, 'train_booking', None) and booking.train_seats:
                try:
                    train = booking.train_booking
                    import json
                    try:
                        booked = json.loads(train.booked_seats or '[]')
                    except Exception:
                        booked = []
                    new_seats = [s.strip() for s in booking.train_seats.split(',') if s.strip()]
                    for s in new_seats:
                        if s not in booked:
                            booked.append(s)
                    train.booked_seats = json.dumps(booked)
                    train.available_seats = max(0, train.total_seats - len(booked))
                    train.save()
                except Exception as seat_err:
                    print("Train seat update warning:", seat_err)
            
            # Add loyalty points safely (cast Decimal amount to float)
            profile.loyalty_points += int(float(amount) * 0.05)
            profile.save()

            # Create payment success & booking confirmation notifications
            try:
                from notifications.models import Notification
                Notification.objects.create(
                    user=request.user,
                    title="💳 Payment Successful & Wallet Deducted",
                    message=f"₹{int(float(amount)):,} has been deducted from your Wallet balance for Booking #GT-{booking.id}.",
                    notification_type="Push"
                )
                Notification.objects.create(
                    user=request.user,
                    title="🎉 Booking Confirmed!",
                    message=f"Your {booking.booking_type.upper()} booking (#GT-{booking.id}) has been confirmed successfully! E-ticket is ready in your Dashboard.",
                    notification_type="Push"
                )
            except Exception as notify_err:
                print("Notification creation warning:", notify_err)
            
            return Response(PaymentSerializer(payment).data)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Payment View Exception:", e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
