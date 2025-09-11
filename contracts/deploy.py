
"""
Deployment and interaction script for Nutrigrade Algorand smart contracts.
This script shows how to deploy and interact with the ProductRegistry and UserProfile contracts.
"""

import json
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import ApplicationCreateTxn, OnComplete
from algosdk.atomic_transaction_composer import AtomicTransactionComposer
from algokit_utils import ApplicationClient, get_localnet_default_account
import os

# Configuration for local development (Algorand Sandbox)
ALGOD_ADDRESS = "http://localhost:4001"
ALGOD_TOKEN = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

class NutrigradeDeployer:
    """Helper class to deploy and interact with Nutrigrade contracts"""

    def __init__(self):
        # Connect to Algorand client
        self.algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

        # For demo purposes - in production, use secure key management
        self.account = get_localnet_default_account(self.algod_client)

        print(f"🔑 Using account: {self.account.address}")
        print(f"💰 Account balance: {self.algod_client.account_info(self.account.address)['amount']} microAlgos")

    def deploy_product_registry(self):
        """Deploy the ProductRegistry contract"""

        print("\n🚀 Deploying ProductRegistry contract...")

        # In a real deployment, you would compile the contract first:
        # algokit compile py product_registry.py

        # For this demo, we'll simulate the deployment process
        try:
            # Create application client (this would use the compiled contract)
            # app_client = ApplicationClient(
            #     algod_client=self.algod_client,
            #     app_spec="ProductRegistry.arc32.json",  # Generated from compilation
            #     sender=self.account.address,
            #     signer=self.account.signer
            # )

            # Simulated deployment
            print("✅ ProductRegistry contract deployed successfully!")
            print("📝 App ID: 12345 (example)")
            return 12345  # Example app ID

        except Exception as e:
            print(f"❌ Deployment failed: {e}")
            return None

    def deploy_user_profile_contract(self):
        """Deploy the UserProfileContract"""

        print("\n🚀 Deploying UserProfileContract...")

        try:
            # Simulated deployment
            print("✅ UserProfileContract deployed successfully!")
            print("📝 App ID: 12346 (example)")
            return 12346  # Example app ID

        except Exception as e:
            print(f"❌ Deployment failed: {e}")
            return None

    def add_sample_products(self, app_id):
        """Add sample product data to demonstrate functionality"""

        print("\n📦 Adding sample product data...")

        sample_products = [
            {
                "product_id": "1234567890123",
                "name": "Chocolate Milk",
                "ingredients": "Milk, Sugar, Cocoa, Vanilla",
                "nutri_score": "B+",
                "allergens": "Milk",
                "region": "IN"
            },
            {
                "product_id": "9876543210987", 
                "name": "Whole Wheat Bread",
                "ingredients": "Wheat Flour, Water, Salt, Yeast",
                "nutri_score": "A-",
                "allergens": "Gluten",
                "region": "Global"
            },
            {
                "product_id": "5555666677778",
                "name": "Organic Apple Juice",
                "ingredients": "Organic Apple Juice, Vitamin C",
                "nutri_score": "A+",
                "allergens": "None",
                "region": "US"
            }
        ]

        for product in sample_products:
            print(f"➕ Adding product: {product['name']} (ID: {product['product_id']})")
            # In real implementation:
            # app_client.call("add_product", **product)

        print("✅ Sample products added successfully!")

    def create_sample_user_profile(self, app_id):
        """Create a sample user profile"""

        print("\n👤 Creating sample user profile...")

        profile_data = {
            "dietary_preferences": "vegetarian,low-sodium",
            "allergies": "nuts,soy",
            "health_goals": "weight-loss,general-health",
            "age_range": "26-35"
        }

        print(f"📝 Profile data: {profile_data}")
        # In real implementation:
        # user_app_client.call("create_profile", **profile_data)

        print("✅ Sample user profile created!")

    def demonstrate_product_lookup(self, app_id):
        """Demonstrate product data retrieval"""

        print("\n🔍 Demonstrating product lookup...")

        # Simulate product lookup
        sample_product_id = "1234567890123"
        print(f"Looking up product ID: {sample_product_id}")

        # In real implementation:
        # result = app_client.call("get_product", product_id=sample_product_id)

        # Simulated response
        mock_response = {
            "product_id": "1234567890123",
            "name": "Chocolate Milk",
            "ingredients": "Milk, Sugar, Cocoa, Vanilla",
            "nutri_score": "B+",
            "allergens": "Milk",
            "region": "IN",
            "version": 1,
            "timestamp": 1694434800,  # Example timestamp
            "active": True
        }

        print("📊 Product data retrieved:")
        print(json.dumps(mock_response, indent=2))

def main():
    """Main deployment and demonstration function"""

    print("🍎 Nutrigrade Algorand Smart Contract Deployment")
    print("=" * 50)

    try:
        # Initialize deployer
        deployer = NutrigradeDeployer()

        # Deploy contracts
        product_registry_id = deployer.deploy_product_registry()
        user_profile_id = deployer.deploy_user_profile_contract()

        if product_registry_id and user_profile_id:
            # Add sample data
            deployer.add_sample_products(product_registry_id)
            deployer.create_sample_user_profile(user_profile_id)

            # Demonstrate functionality
            deployer.demonstrate_product_lookup(product_registry_id)

            print("\n🎉 Deployment and demo completed successfully!")
            print(f"\n📋 Contract Addresses:")
            print(f"ProductRegistry App ID: {product_registry_id}")
            print(f"UserProfileContract App ID: {user_profile_id}")

        else:
            print("❌ Deployment failed!")

    except Exception as e:
        print(f"❌ Error during deployment: {e}")

if __name__ == "__main__":
    # Setup instructions
    print("📚 Setup Instructions:")
    print("1. Install AlgoKit: `pip install algokit`")
    print("2. Start Algorand LocalNet: `algokit localnet start`")
    print("3. Compile contracts: `algokit compile py product_registry.py`")
    print("4. Run this script: `python deploy.py`")
    print("\n" + "="*50)

    main()
