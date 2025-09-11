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


# Define the ProductData structure using ARC4 types (without allergies and nutrition score)
class ProductData(arc4.Struct):
    """Structure to hold basic product information (sensitive health data excluded)"""
    product_id: arc4.String
    name: arc4.String
    ingredients: arc4.String
    region: arc4.String  # IN, US, EU, Global, etc.
    version: arc4.UInt64
    timestamp: arc4.UInt64
    active: arc4.Bool
    manufacturer: arc4.String  # Brand/manufacturer name
    category: arc4.String  # Food category (dairy, snacks, beverages, etc.)


class ProductRegistry(ARC4Contract):
    """
    Smart contract to store and manage basic product data on Algorand blockchain.
    Each product is identified by a unique product_id (barcode number).
    
    Privacy-focused design:
    - No allergies or nutrition scores stored on-chain
    - Only basic product information for transparency
    - Health-related analysis handled off-chain or via user profile contracts
    """

    def __init__(self) -> None:
        # Global state variables
        self.owner = GlobalState(Txn.sender)
        self.total_products = GlobalState(UInt64(0))
        self.contract_version = GlobalState(UInt64(2))  # Updated version
        self.authorized_updaters = GlobalState(UInt64(0))  # Track authorized users
        
        # Box storage for product data - more efficient for large data
        # Key format: "product_{product_id}"
        self.product_data = BoxMap(String, ProductData)
        
        # Track product versions - Key format: "version_{product_id}"
        self.product_versions = BoxMap(String, UInt64)
        
        # Track authorized addresses for product management
        # Key format: "auth_{address}"
        self.authorized_addresses = BoxMap(String, arc4.Bool)

    @arc4.abimethod
    def add_product(
        self,
        product_id: arc4.String,
        name: arc4.String,
        ingredients: arc4.String,
        region: arc4.String,
        manufacturer: arc4.String,
        category: arc4.String,
    ) -> arc4.Bool:
        """Add a new product to the registry"""
        # Check authorization - fixed string handling
        user_address_str = String.from_bytes(Txn.sender.bytes)
        auth_key = String("auth_") + user_address_str
        
        authorized = (
            Txn.sender == self.owner.value or 
            (auth_key in self.authorized_addresses and self.authorized_addresses[auth_key].native)
        )
        assert authorized, "Not authorized to add products"
        
        product_key = String("product_") + product_id.native
        version_key = String("version_") + product_id.native
        
        # Check if product already exists
        if product_key in self.product_data:
            return arc4.Bool(False)  # Product already exists
        
        # Create product data (no sensitive health info)
        new_product = ProductData(
            product_id=product_id,
            name=name,
            ingredients=ingredients,
            region=region,
            version=arc4.UInt64(1),
            timestamp=arc4.UInt64(op.Global.latest_timestamp),
            active=arc4.Bool(True),
            manufacturer=manufacturer,
            category=category
        )
        
        # Store product data and version
        self.product_data[product_key] = new_product
        self.product_versions[version_key] = UInt64(1)
        
        # Update total count
        self.total_products.value = self.total_products.value + UInt64(1)
        
        return arc4.Bool(True)

    @arc4.abimethod
    def update_product(
        self,
        product_id: arc4.String,
        name: arc4.String,
        ingredients: arc4.String,
        region: arc4.String,
        manufacturer: arc4.String,
        category: arc4.String,
    ) -> arc4.Bool:
        """Update existing product data with versioning"""
        # Check authorization - fixed string handling
        user_address_str = String.from_bytes(Txn.sender.bytes)
        auth_key = String("auth_") + user_address_str
        
        authorized = (
            Txn.sender == self.owner.value or 
            (auth_key in self.authorized_addresses and self.authorized_addresses[auth_key].native)
        )
        assert authorized, "Not authorized to update products"
        
        product_key = String("product_") + product_id.native
        version_key = String("version_") + product_id.native
        
        # Check if product exists
        if product_key not in self.product_data:
            return arc4.Bool(False)  # Product doesn't exist
        
        # Get current version and increment
        current_version = self.product_versions[version_key]
        new_version = current_version + UInt64(1)
        
        # Update product data
        updated_product = ProductData(
            product_id=product_id,
            name=name,
            ingredients=ingredients,
            region=region,
            version=arc4.UInt64(new_version),
            timestamp=arc4.UInt64(op.Global.latest_timestamp),
            active=arc4.Bool(True),
            manufacturer=manufacturer,
            category=category
        )
        
        # Store updated data
        self.product_data[product_key] = updated_product
        self.product_versions[version_key] = new_version
        
        return arc4.Bool(True)

    @arc4.abimethod(readonly=True)
    def get_product(self, product_id: arc4.String) -> ProductData:
        """Retrieve product data by product ID"""
        product_key = String("product_") + product_id.native
        
        # Check if product exists
        assert product_key in self.product_data, "Product not found"
        
        return self.product_data[product_key]

    @arc4.abimethod(readonly=True)
    def get_product_version(self, product_id: arc4.String) -> arc4.UInt64:
        """Get current version of a product"""
        version_key = String("version_") + product_id.native
        
        if version_key not in self.product_versions:
            return arc4.UInt64(0)  # Product not found
        
        return arc4.UInt64(self.product_versions[version_key])

    @arc4.abimethod(readonly=True)
    def get_total_products(self) -> arc4.UInt64:
        """Get total number of products in registry"""
        return arc4.UInt64(self.total_products.value)

    @arc4.abimethod
    def deactivate_product(self, product_id: arc4.String) -> arc4.Bool:
        """Deactivate a product (mark as inactive)"""
        # Check authorization - fixed string handling
        user_address_str = String.from_bytes(Txn.sender.bytes)
        auth_key = String("auth_") + user_address_str
        
        authorized = (
            Txn.sender == self.owner.value or 
            (auth_key in self.authorized_addresses and self.authorized_addresses[auth_key].native)
        )
        assert authorized, "Not authorized to deactivate products"
        
        product_key = String("product_") + product_id.native
        
        if product_key not in self.product_data:
            return arc4.Bool(False)
        
        # Get current product data and update active status
        current_product = self.product_data[product_key]
        current_product.active = arc4.Bool(False)
        self.product_data[product_key] = current_product
        
        return arc4.Bool(True)

    @arc4.abimethod
    def authorize_user(self, user_address: arc4.String) -> arc4.Bool:
        """Authorize a user to manage products (owner only)"""
        assert Txn.sender == self.owner.value, "Only owner can authorize users"
        
        auth_key = String("auth_") + user_address.native
        self.authorized_addresses[auth_key] = arc4.Bool(True)
        self.authorized_updaters.value = self.authorized_updaters.value + UInt64(1)
        
        return arc4.Bool(True)

    @arc4.abimethod
    def revoke_authorization(self, user_address: arc4.String) -> arc4.Bool:
        """Revoke user authorization (owner only)"""
        assert Txn.sender == self.owner.value, "Only owner can revoke authorization"
        
        auth_key = String("auth_") + user_address.native
        
        if auth_key in self.authorized_addresses and self.authorized_addresses[auth_key].native:
            self.authorized_addresses[auth_key] = arc4.Bool(False)
            if self.authorized_updaters.value > UInt64(0):
                self.authorized_updaters.value = self.authorized_updaters.value - UInt64(1)
            return arc4.Bool(True)
        
        return arc4.Bool(False)

    @arc4.abimethod(readonly=True)
    def is_authorized(self, user_address: arc4.String) -> arc4.Bool:
        """Check if user is authorized to manage products"""
        auth_key = String("auth_") + user_address.native
        
        if auth_key not in self.authorized_addresses:
            return arc4.Bool(False)
        
        return self.authorized_addresses[auth_key]