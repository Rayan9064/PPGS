
from algopy import (
    ARC4Contract,
    BoxMap,
    GlobalState,
    String,
    UInt64,
    arc4,
    gtxn,
    subroutine,
    Txn,
    op,
)

class UserProfile(arc4.Struct):
    """Structure to hold user profile information"""
    user_address: arc4.String
    dietary_preferences: arc4.String  # Comma-separated preferences
    allergies: arc4.String           # Comma-separated allergies
    health_goals: arc4.String        # User's health objectives
    age_range: arc4.String          # Age range category
    created_timestamp: arc4.UInt64   # When profile was created
    total_scans: arc4.UInt64        # Number of products scanned
    active: arc4.Bool               # Profile status


class ConsumptionRecord(arc4.Struct):
    """Structure to hold consumption history"""
    user_address: arc4.String
    product_id: arc4.String
    consumption_rating: arc4.UInt64  # 1-5 rating
    notes: arc4.String              # User notes about the product
    timestamp: arc4.UInt64          # When consumption was recorded

class UserProfileContract(ARC4Contract):
    """
    Smart contract to manage user profiles and dietary preferences.
    Links user addresses to their nutrition preferences and consumption history.
    """

    def __init__(self) -> None:
        self.owner = GlobalState(Txn.sender)
        self.total_users = GlobalState(UInt64(0))

        # Box storage for user profiles - Key: user address
        self.user_profiles = BoxMap(String, UserProfile)

        # Track user consumption - Key: "consumption_{user_address}_{product_id}"
        self.consumption_history = BoxMap(String, ConsumptionRecord)

    @arc4.abimethod
    def create_profile(
        self,
        dietary_preferences: arc4.String,  # "vegetarian,gluten-free,low-sodium"
        allergies: arc4.String,            # "milk,nuts,soy"
        health_goals: arc4.String,         # "weight-loss,muscle-gain,general-health"
        age_range: arc4.String,            # "18-25,26-35,36-50,50+"
    ) -> arc4.Bool:
        """Create user profile with dietary preferences"""

        user_address = String.from_bytes(Txn.sender.bytes)

        # Check if profile already exists
        if user_address in self.user_profiles:
            return arc4.Bool(False)  # Profile already exists

        # Create new profile
        new_profile = UserProfile(
            user_address=arc4.String(user_address.native),
            dietary_preferences=dietary_preferences,
            allergies=allergies,
            health_goals=health_goals,
            age_range=age_range,
            created_timestamp=arc4.UInt64(op.Global.latest_timestamp),
            total_scans=arc4.UInt64(0),
            active=arc4.Bool(True)
        )

        # Store profile
        self.user_profiles[user_address] = new_profile
        self.total_users.value += UInt64(1)

        return arc4.Bool(True)

    @arc4.abimethod
    def update_profile(
        self,
        dietary_preferences: arc4.String,
        allergies: arc4.String,
        health_goals: arc4.String,
        age_range: arc4.String,
    ) -> arc4.Bool:
        """Update existing user profile"""

        user_address = String.from_bytes(Txn.sender.bytes)

        # Check if profile exists
        if user_address not in self.user_profiles:
            return arc4.Bool(False)  # Profile doesn't exist

        # Get current profile and update
        current_profile = self.user_profiles[user_address]

        updated_profile = UserProfile(
            user_address=arc4.String(user_address.native),
            dietary_preferences=dietary_preferences,
            allergies=allergies,
            health_goals=health_goals,
            age_range=age_range,
            created_timestamp=current_profile.created_timestamp,
            total_scans=current_profile.total_scans,
            active=arc4.Bool(True)
        )

        self.user_profiles[user_address] = updated_profile

        return arc4.Bool(True)

    @arc4.abimethod
    def record_consumption(
        self,
        product_id: arc4.String,
        consumption_rating: arc4.UInt64,  # 1-5 rating
        notes: arc4.String,
    ) -> arc4.Bool:
        """Record user's consumption of a product"""

        user_address = String.from_bytes(Txn.sender.bytes)

        # Check if user profile exists
        if user_address not in self.user_profiles:
            return arc4.Bool(False)  # User must have profile first

        # Create consumption record key
        consumption_key = String("consumption_" + user_address.native + "_" + product_id.native)

        # Create consumption record
        consumption_record = ConsumptionRecord(
            user_address=arc4.String(user_address.native),
            product_id=product_id,
            consumption_rating=consumption_rating,
            notes=notes,
            timestamp=arc4.UInt64(op.Global.latest_timestamp)
        )

        # Store consumption record
        self.consumption_history[consumption_key] = consumption_record

        # Update user's total scans
        current_profile = self.user_profiles[user_address]
        current_profile.total_scans = arc4.UInt64(current_profile.total_scans.native + 1)
        self.user_profiles[user_address] = current_profile

        return arc4.Bool(True)

    @arc4.abimethod(readonly=True)
    def get_user_profile(self, user_address: arc4.String) -> UserProfile:
        """Get user profile by address"""

        address_key = String(user_address.native)

        assert address_key in self.user_profiles, "User profile not found"

        return self.user_profiles[address_key]

    @arc4.abimethod(readonly=True)
    def get_my_profile(self) -> UserProfile:
        """Get current user's profile"""

        user_address = String.from_bytes(Txn.sender.bytes)

        assert user_address in self.user_profiles, "User profile not found"

        return self.user_profiles[user_address]

    @arc4.abimethod(readonly=True)
    def get_consumption_record(
        self, 
        user_address: arc4.String, 
        product_id: arc4.String
    ) -> ConsumptionRecord:
        """Get consumption record for a specific user and product"""

        consumption_key = String("consumption_" + user_address.native + "_" + product_id.native)

        assert consumption_key in self.consumption_history, "Consumption record not found"

        return self.consumption_history[consumption_key]

    @arc4.abimethod(readonly=True)
    def get_total_users(self) -> arc4.UInt64:
        """Get total number of registered users"""
        return arc4.UInt64(self.total_users.value)
