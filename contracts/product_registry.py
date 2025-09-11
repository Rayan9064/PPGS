
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

class ProductRegistry(ARC4Contract):
    """
    Smart contract to store and manage product data on Algorand blockchain.
    Each product is identified by a unique product_id (barcode number).
    """

    def __init__(self) -> None:
        # Global state variables
        self.owner = GlobalState(Txn.sender)
        self.total_products = GlobalState(UInt64(0))
        self.contract_version = GlobalState(UInt64(1))

        # Box storage for product data - more efficient for large data
        # Key format: "product_{product_id}"
        self.product_data: BoxMap[String, ProductData] = BoxMap()

        # Track product versions - Key format: "version_{product_id}" 
        self.product_versions: BoxMap[String, UInt64] = BoxMap()

    @arc4.abimethod
    def add_product(
        self,
        product_id: arc4.String,
        name: arc4.String,
        ingredients: arc4.String,
        nutri_score: arc4.String,
        allergens: arc4.String,
        region: arc4.String,
    ) -> arc4.Bool:
        """Add a new product to the registry"""

        # Only owner can add products initially (can be extended for authorized users)
        assert Txn.sender == self.owner, "Only owner can add products"

        product_key = "product_" + product_id.native
        version_key = "version_" + product_id.native

        # Check if product already exists
        if product_key in self.product_data:
            return arc4.Bool(False)  # Product already exists

        # Create product data
        new_product = ProductData(
            product_id=product_id,
            name=name,
            ingredients=ingredients,
            nutri_score=nutri_score,
            allergens=allergens,
            region=region,
            version=arc4.UInt64(1),
            timestamp=arc4.UInt64(op.Global.latest_timestamp),
            active=arc4.Bool(True)
        )

        # Store product data and version
        self.product_data[product_key] = new_product
        self.product_versions[version_key] = UInt64(1)

        # Update total count
        self.total_products.value += UInt64(1)

        return arc4.Bool(True)

    @arc4.abimethod  
    def update_product(
        self,
        product_id: arc4.String,
        name: arc4.String,
        ingredients: arc4.String,
        nutri_score: arc4.String,
        allergens: arc4.String,
        region: arc4.String,
    ) -> arc4.Bool:
        """Update existing product data with versioning"""

        # Only owner can update (extend for authorized users)
        assert Txn.sender == self.owner, "Only owner can update products"

        product_key = "product_" + product_id.native
        version_key = "version_" + product_id.native

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
            nutri_score=nutri_score,
            allergens=allergens,
            region=region,
            version=arc4.UInt64(new_version),
            timestamp=arc4.UInt64(op.Global.latest_timestamp),
            active=arc4.Bool(True)
        )

        # Store updated data
        self.product_data[product_key] = updated_product
        self.product_versions[version_key] = new_version

        return arc4.Bool(True)

    @arc4.abimethod(readonly=True)
    def get_product(self, product_id: arc4.String) -> ProductData:
        """Retrieve product data by product ID"""

        product_key = "product_" + product_id.native

        # Check if product exists
        assert product_key in self.product_data, "Product not found"

        return self.product_data[product_key]

    @arc4.abimethod(readonly=True)
    def get_product_version(self, product_id: arc4.String) -> arc4.UInt64:
        """Get current version of a product"""

        version_key = "version_" + product_id.native

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

        assert Txn.sender == self.owner, "Only owner can deactivate products"

        product_key = "product_" + product_id.native

        if product_key not in self.product_data:
            return arc4.Bool(False)

        # Get current product data and update active status
        current_product = self.product_data[product_key]
        current_product.active = arc4.Bool(False)
        self.product_data[product_key] = current_product

        return arc4.Bool(True)


# Define the ProductData structure using ARC4 types
class ProductData(arc4.Struct):
    """Structure to hold product information"""
    product_id: arc4.String
    name: arc4.String  
    ingredients: arc4.String
    nutri_score: arc4.String  # A+, A, B+, B, C+, C, D, E
    allergens: arc4.String
    region: arc4.String       # IN, US, EU, Global, etc.
    version: arc4.UInt64
    timestamp: arc4.UInt64
    active: arc4.Bool
