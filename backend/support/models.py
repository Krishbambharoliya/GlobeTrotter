from django.db import models

class FAQ(models.Model):
    question = models.CharField(max_length=250)
    answer = models.TextField()
    category = models.CharField(max_length=50, default='General') # General, Flights, Hotels, Trains, Packages, Payments

    def __str__(self):
        return self.question

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"
