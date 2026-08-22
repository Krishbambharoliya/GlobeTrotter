from django.db import models
from django.contrib.auth.models import User

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    category = models.CharField(max_length=50) # flight, hotel, train, package
    target_id = models.IntegerField() # foreign key representation depending on category
    rating = models.IntegerField(default=5) # 1 to 5 stars
    comment = models.TextField()
    likes = models.IntegerField(default=0)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} - Rating: {self.rating}"
