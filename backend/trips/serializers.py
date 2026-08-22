from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Trip, TripStop, TripActivity

class TripActivitySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    name = serializers.CharField(required=False, allow_blank=True, default='Activity')
    category = serializers.CharField(required=False, allow_blank=True, default='Sightseeing')
    cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0.00)
    duration_hours = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, default=1.00)
    start_time = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='09:00 AM')
    order = serializers.IntegerField(required=False, default=0)

    class Meta:
        model = TripActivity
        fields = ['id', 'name', 'description', 'category', 'cost', 'duration_hours', 'start_time', 'order']

class TripStopSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    activities = TripActivitySerializer(many=True, required=False)

    class Meta:
        model = TripStop
        fields = ['id', 'city_name', 'country_name', 'cost_index', 'popularity', 'date', 'order', 'activities']
        extra_kwargs = {
            'city_name': {'required': False, 'allow_blank': True, 'default': 'Destination City'},
            'country_name': {'required': False, 'allow_blank': True, 'default': 'Country'},
            'cost_index': {'required': False, 'allow_blank': True, 'default': '$$'},
            'popularity': {'required': False, 'allow_blank': True, 'default': 'High'},
            'date': {'required': False, 'allow_null': True},
            'order': {'required': False, 'default': 0}
        }

class TripSerializer(serializers.ModelSerializer):
    stops = TripStopSerializer(many=True, required=False)
    user_username = serializers.CharField(source='user.username', read_only=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ['id', 'user', 'user_username', 'name', 'description', 'start_date', 'end_date', 'cover_photo', 'is_public', 'budget_limit', 'total_cost', 'stops', 'created_at', 'updated_at']
        read_only_fields = ['user']

    def get_total_cost(self, obj):
        total = 0
        for stop in obj.stops.all():
            for activity in stop.activities.all():
                total += activity.cost
        return total

    def create(self, validated_data):
        stops_data = validated_data.pop('stops', [])
        trip = Trip.objects.create(**validated_data)
        
        for stop_order, stop_data in enumerate(stops_data):
            activities_data = stop_data.pop('activities', [])
            stop = TripStop.objects.create(trip=trip, order=stop_order, **stop_data)
            
            for act_order, act_data in enumerate(activities_data):
                TripActivity.objects.create(stop=stop, order=act_order, **act_data)
                
        return trip

    def update(self, instance, validated_data):
        stops_data = validated_data.pop('stops', None)
        
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.cover_photo = validated_data.get('cover_photo', instance.cover_photo)
        instance.is_public = validated_data.get('is_public', instance.is_public)
        instance.budget_limit = validated_data.get('budget_limit', instance.budget_limit)
        instance.save()
        
        if stops_data is not None:
            # Simple approach: clear and rebuild nested stops & activities to support reordering & deletions easily
            instance.stops.all().delete()
            for stop_order, stop_data in enumerate(stops_data):
                activities_data = stop_data.pop('activities', [])
                # Remove id from stop_data if present to avoid integrity error on auto-increment field
                stop_data.pop('id', None)
                stop = TripStop.objects.create(trip=instance, order=stop_order, **stop_data)
                
                for act_order, act_data in enumerate(activities_data):
                    act_data.pop('id', None)
                    TripActivity.objects.create(stop=stop, order=act_order, **act_data)
                    
        return instance
