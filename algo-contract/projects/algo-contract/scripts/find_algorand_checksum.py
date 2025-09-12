from algosdk import mnemonic, account

#  never use mnemonics in code, for demo purposes only
mymnemonic = "meat tuna same trick demand human kiss weapon dry dad cinnamon ugly expand myth auto tissue today deputy bubble market empty caution radio abstract gadget"


# utility function to restore account
def restore_account():
    # restore private key from mnemonic
    pk_account = mnemonic.to_private_key(mymnemonic)
    # restore account address from private key
    address = account.address_from_private_key(pk_account)
    print("Address :", address)


restore_account()
