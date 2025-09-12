import os
import sys
from pathlib import Path

# Ensure project root is on sys.path so "smart_contracts" can be imported
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import algokit_utils
from smart_contracts.artifacts.nutri_contract.nutri_grade_simple_client import (
    NutriGradeSimpleClient,
    AddProductArgs,
    ScanProductArgs,
)

APP_ID = int(os.environ.get("NUTRI_APP_ID", "745699681"))

algorand = algokit_utils.AlgorandClient.from_environment()
# Instantiate client for a specific deployed app id
client = NutriGradeSimpleClient(algorand=algorand, app_id=APP_ID)

print(f"Connected to NutriGradeSimple app_id={client.app_id}")
print("Available methods:", [m.name for m in client.app_spec.contract.methods])

"""Quick interactions with the NutriGradeSimple contract on TestNet"""

# Read-only example
if hasattr(client.send, "get_stats"):
    res = client.send.get_stats()
    print("get_stats ->", res.abi_return)  # tuple(total_products, total_scans)

"""Write calls below require DEPLOYER_MNEMONIC (25 words) set in environment"""

# Opt-in current account (safe to call multiple times)
if hasattr(client.send, "opt_in"):
    try:
        out = client.send.opt_in()
        print("opt_in ->", out.abi_return)
    except Exception as e:
        print("opt_in skipped/failed:", e)

# Add a product (owner-only)
if hasattr(client.send, "add_product"):
    try:
        out = client.send.add_product(AddProductArgs(
            product_id="P100",
            name="Demo Product",
            ingredients="salt,sugar",
        ))
        print("add_product ->", out.abi_return)
    except Exception as e:
        print("add_product failed:", e)

# Scan a product (any user; requires opt-in)
if hasattr(client.send, "scan_product"):
    try:
        out = client.send.scan_product(ScanProductArgs(product_id="P100"))
        print("scan_product ->", out.abi_return)
    except Exception as e:
        print("scan_product failed:", e)
