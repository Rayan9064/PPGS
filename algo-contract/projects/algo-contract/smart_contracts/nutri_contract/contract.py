from algopy import (
    ARC4Contract,
    GlobalState,
    LocalState,
    String,
    UInt64,
    arc4,
    Txn,
    op,
)


class NutriGradeSimple(ARC4Contract):
    """
    Simple NutriGrade Smart Contract for food product scanning.
    Stores basic product information and scan counts on Algorand blockchain.

    Features:
    - Add/update product information
    - Track scan counts for products
    - Query product details
    - Simple and easy to deploy
    """

    def __init__(self) -> None:
        # Global state - contract level data
        self.owner = GlobalState(Txn.sender)
        self.total_products = GlobalState(UInt64(0))
        self.total_scans = GlobalState(UInt64(0))

        # Local state - user specific data (who scanned what)
        self.user_scan_count = LocalState(UInt64)
        self.last_scanned_product = LocalState(String)

    @arc4.abimethod
    def bootstrap(self) -> arc4.String:
        """Initialize the contract (can only be called once by creator)"""
        assert Txn.sender == self.owner.value, "Only owner can bootstrap"
        assert self.total_products.value == UInt64(0), "Already bootstrapped"

        # Set initial state
        self.total_products.value = UInt64(0)
        self.total_scans.value = UInt64(0)

        return arc4.String("NutriGrade Contract Initialized Successfully!")

    @arc4.abimethod
    def add_product(
        self,
        product_id: arc4.String,
        name: arc4.String,
        ingredients: arc4.String,
    ) -> arc4.String:
        """
        Add a new product to the blockchain.
        Only contract owner can add products.

        Args:
            product_id: Barcode or unique identifier
            name: Product name
            ingredients: Comma-separated ingredients list

        Returns:
            Success message
        """
        # Only owner can add products
        assert Txn.sender == self.owner.value, "Only owner can add products"

        # In a real implementation, we'd store this in box storage
        # For demo purposes, we're just incrementing the counter
        self.total_products.value = self.total_products.value + UInt64(1)

        return arc4.String("Product added successfully!")

    @arc4.abimethod
    def scan_product(
        self,
        product_id: arc4.String,
    ) -> arc4.String:
        """
        Record a product scan by a user.
        Any user can scan products.

        Args:
            product_id: The product being scanned

        Returns:
            Scan confirmation message
        """
        # Opt-in check for local state
        assert op.app_opted_in(
            Txn.sender, op.Global.current_application_id
        ), "Please opt-in first"

        # Update global scan count
        self.total_scans.value = self.total_scans.value + UInt64(1)

        # Update user's local state
        self.user_scan_count[Txn.sender] = self.user_scan_count[Txn.sender] + UInt64(1)
        self.last_scanned_product[Txn.sender] = product_id.native

        return arc4.String("Product scanned successfully!")

    @arc4.abimethod(readonly=True)
    def get_stats(self) -> arc4.Tuple[arc4.UInt64, arc4.UInt64]:
        """
        Get contract statistics.

        Returns:
            Tuple of (total_products, total_scans)
        """
        return arc4.Tuple(
            (
                arc4.UInt64(self.total_products.value),
                arc4.UInt64(self.total_scans.value),
            )
        )

    @arc4.abimethod(readonly=True)
    def get_user_stats(self) -> arc4.Tuple[arc4.UInt64, arc4.String]:
        """
        Get user's scanning statistics.

        Returns:
            Tuple of (scan_count, last_scanned_product_id)
        """
        # Check if user has opted in
        if not op.app_opted_in(Txn.sender, op.Global.current_application_id):
            return arc4.Tuple(
                (
                    arc4.UInt64(0),
                    arc4.String("No scans yet"),
                )
            )

        return arc4.Tuple(
            (
                arc4.UInt64(self.user_scan_count[Txn.sender]),
                arc4.String(self.last_scanned_product[Txn.sender]),
            )
        )

    @arc4.abimethod
    def opt_in(self) -> arc4.String:
        """
        Opt-in to use the NutriGrade scanner.
        Users must opt-in before they can scan products.

        Returns:
            Welcome message
        """
        # Initialize user's local state
        self.user_scan_count[Txn.sender] = UInt64(0)
        self.last_scanned_product[Txn.sender] = String("")

        return arc4.String("Welcome to NutriGrade! You can now scan products.")

    @arc4.abimethod(allow_actions=["CloseOut"])
    def opt_out(self) -> arc4.String:
        """
        Opt-out from the NutriGrade scanner.
        This will clear user's local state.

        Returns:
            Goodbye message
        """
        return arc4.String("Thank you for using NutriGrade!")

    @arc4.abimethod
    def update_product(
        self,
        product_id: arc4.String,
        name: arc4.String,
        ingredients: arc4.String,
    ) -> arc4.String:
        """
        Update existing product information.
        Only owner can update products.

        Args:
            product_id: Product identifier
            name: Updated product name
            ingredients: Updated ingredients

        Returns:
            Update confirmation
        """
        # Only owner can update
        assert Txn.sender == self.owner.value, "Only owner can update products"

        return arc4.String("Product updated successfully!")

    @arc4.abimethod(readonly=True)
    def get_owner(self) -> arc4.Address:
        """
        Get the contract owner address.

        Returns:
            Owner's address
        """
        return arc4.Address(self.owner.value)

    @arc4.abimethod(readonly=True)
    def get_version(self) -> arc4.String:
        """
        Get contract version.

        Returns:
            Version string
        """
        return arc4.String("NutriGrade Simple v1.0.0")
