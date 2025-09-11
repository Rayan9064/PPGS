from algopy import (
    ARC4Contract,
    Box,
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


# Define user dietary preferences structure
class UserPreferences(arc4.Struct):
    """Structure to hold user dietary preferences and restrictions"""
    user_address: arc4.String
    is_vegetarian: arc4.Bool
    is_vegan: arc4.Bool
    is_gluten_free: arc4.Bool
    is_lactose_intolerant: arc4.Bool
    is_nut_allergy: arc4.Bool
    is_diabetic: arc4.Bool
    timestamp: arc4.UInt64
    active: arc4.Bool


# Define scanned product history
class ScannedProduct(arc4.Struct):
    """Structure to track products scanned by user"""
    product_id: arc4.String
    scan_timestamp: arc4.UInt64
    rating: arc4.UInt8  # 0-5 rating
    is_favorite: arc4.Bool


class UserProfileContract(ARC4Contract):
    """
    Smart contract to manage user profiles and preferences for the food scanner app.
    Each user can store their dietary preferences and track scanned products.
    
    Privacy-focused design:
    - User controls their own data
    - Minimal health information stored
    - Can delete/update their profile anytime
    """

    def __init__(self) -> None:
        # Global state variables
        self.owner = GlobalState(Txn.sender)
        self.total_users = GlobalState(UInt64(0))
        self.contract_version = GlobalState(UInt64(1))
        
        # Box storage for user preferences
        # Key format: "pref_{user_address}"
        self.user_preferences = BoxMap(String, UserPreferences)
        
        # Box storage for user's scanned products history
        # Key format: "scan_{user_address}_{product_id}"
        self.scanned_products = BoxMap(String, ScannedProduct)
        
        # Track number of products scanned per user
        # Key format: "count_{user_address}"
        self.user_scan_counts = BoxMap(String, UInt64)

    @arc4.abimethod
    def create_profile(
        self,
        is_vegetarian: arc4.Bool,
        is_vegan: arc4.Bool,
        is_gluten_free: arc4.Bool,
        is_lactose_intolerant: arc4.Bool,
        is_nut_allergy: arc4.Bool,
        is_diabetic: arc4.Bool,
    ) -> arc4.Bool:
        """Create or update user profile with dietary preferences"""
        user_address_str = String.from_bytes(Txn.sender.bytes)
        pref_key = String("pref_") + user_address_str
        
        # Check if this is a new user
        is_new_user = pref_key not in self.user_preferences
        
        # Create/update user preferences
        new_preferences = UserPreferences(
            user_address=arc4.String(user_address_str),
            is_vegetarian=is_vegetarian,
            is_vegan=is_vegan,
            is_gluten_free=is_gluten_free,
            is_lactose_intolerant=is_lactose_intolerant,
            is_nut_allergy=is_nut_allergy,
            is_diabetic=is_diabetic,
            timestamp=arc4.UInt64(op.Global.latest_timestamp),
            active=arc4.Bool(True)
        )
        
        # Store preferences
        self.user_preferences[pref_key] = new_preferences
        
        # Initialize scan count for new users
        if is_new_user:
            count_key = String("count_") + user_address_str
            self.user_scan_counts[count_key] = UInt64(0)
            self.total_users.value = self.total_users.value + UInt64(1)
        
        return arc4.Bool(True)

    @arc4.abimethod
    def update_preferences(
        self,
        is_vegetarian: arc4.Bool,
        is_vegan: arc4.Bool,
        is_gluten_free: arc4.Bool,
        is_lactose_intolerant: arc4.Bool,
        is_nut_allergy: arc4.Bool,
        is_diabetic: arc4.Bool,
    ) -> arc4.Bool:
        """Update user dietary preferences"""
        user_address_str = String.from_bytes(Txn.sender.bytes)
        pref_key = String("pref_") + user_address_str
        
        # Check if user profile exists
        assert pref_key in self.user_preferences, "Profile not found"
        
        # Get current preferences and update
        current_prefs = self.user_preferences[pref_key]
        current_prefs.is_vegetarian = is_vegetarian
        current_prefs.is_vegan = is_vegan
        current_prefs.is_gluten_free = is_gluten_free
        current_prefs.is_lactose_intolerant = is_lactose_intolerant
        current_prefs.is_nut_allergy = is_nut_allergy
        current_prefs.is_diabetic = is_diabetic
        current_prefs.timestamp = arc4.UInt64(op.Global.latest_timestamp)
        
        # Store updated preferences
        self.user_preferences[pref_key] = current_prefs
        
        return arc4.Bool(True)

    @arc4.abimethod
    def record_scan(
        self,
        product_id: arc4.String,
        rating: arc4.UInt8,
        is_favorite: arc4.Bool,
    ) -> arc4.Bool:
        """Record a product scan by the user"""
        user_address_str = String.from_bytes(Txn.sender.bytes)
        
        # Check if user has a profile
        pref_key = String("pref_") + user_address_str
        assert pref_key in self.user_preferences, "User profile not found"
        
        # Create scan key
        scan_key = String("scan_") + user_address_str + String("_") + product_id.native
        
        # Check rating is valid (0-5)
        assert rating.native <= UInt64(5), "Rating must be between 0-5"
        
        # Create scan record
        scan_record = ScannedProduct(
            product_id=product_id,
            scan_timestamp=arc4.UInt64(op.Global.latest_timestamp),
            rating=rating,
            is_favorite=is_favorite
        )
        
        # Check if this is a new scan for this user
        if scan_key not in self.scanned_products:
            # Increment user's scan count
            count_key = String("count_") + user_address_str
            current_count = self.user_scan_counts[count_key]
            self.user_scan_counts[count_key] = current_count + UInt64(1)
        
        # Store scan record (overwrites if already exists)
        self.scanned_products[scan_key] = scan_record
        
        return arc4.Bool(True)

    @arc4.abimethod(readonly=True)
    def get_preferences(self) -> UserPreferences:
        """Get user's dietary preferences"""
        user_address_str = String.from_bytes(Txn.sender.bytes)
        pref_key = String("pref_") + user_address_str
        
        assert pref_key in self.user_preferences, "Profile not found"
        
        return self.user_preferences[pref_key]

    @arc4.abimethod(readonly=True)
    def get_scan_history(self, product_id: arc4.String) -> ScannedProduct:
        """Get user's scan record for a specific product"""
        user_address_str = String.from_bytes(Txn.sender.bytes)
        scan_key = String("scan_") + user_address_str + String("_") + String(product_id.native)
        
        assert scan_key in self.scanned_products, "Scan record not found"
        
        return self.scanned_products[scan_key]

    @arc4.abimethod(readonly=True)
    def get_scan_count(self) -> arc4.UInt64:
        """Get total number of products scanned by user"""
        user_address_str = String.from_bytes(Txn.sender.bytes)
        count_key = String("count_") + user_address_str
        
        if count_key not in self.user_scan_counts:
            return arc4.UInt64(0)
        
        return arc4.UInt64(self.user_scan_counts[count_key])

    @arc4.abimethod(readonly=True)
    def has_profile(self) -> arc4.Bool:
        """Check if user has created a profile"""
        user_address_str = String.from_bytes(Txn.sender.bytes)
        pref_key = String("pref_") + user_address_str
        
        return arc4.Bool(pref_key in self.user_preferences)

    @arc4.abimethod
    def delete_profile(self) -> arc4.Bool:
        """Delete user's profile (user can only delete their own)"""
        user_address_str = String.from_bytes(Txn.sender.bytes)
        pref_key = String("pref_") + user_address_str
        
        # Check if profile exists
        if pref_key not in self.user_preferences:
            return arc4.Bool(False)
        
        # Mark profile as inactive (soft delete)
        current_prefs = self.user_preferences[pref_key]
        current_prefs.active = arc4.Bool(False)
        self.user_preferences[pref_key] = current_prefs
        
        # Decrement total users
        if self.total_users.value > UInt64(0):
            self.total_users.value = self.total_users.value - UInt64(1)
        
        return arc4.Bool(True)

    @arc4.abimethod(readonly=True)
    def get_total_users(self) -> arc4.UInt64:
        """Get total number of active users"""
        return arc4.UInt64(self.total_users.value)

    @arc4.abimethod
    def toggle_favorite(self, product_id: arc4.String) -> arc4.Bool:
        """Toggle favorite status for a scanned product"""
        user_address_str = String.from_bytes(Txn.sender.bytes)
        scan_key = String("scan_") + user_address_str + String("_") + String(product_id.native)
        
        # Check if scan record exists
        if scan_key not in self.scanned_products:
            return arc4.Bool(False)
        
        # Toggle favorite status
        scan_record = self.scanned_products[scan_key]
        scan_record.is_favorite = arc4.Bool(not scan_record.is_favorite.native)
        self.scanned_products[scan_key] = scan_record
        
        return arc4.Bool(True)