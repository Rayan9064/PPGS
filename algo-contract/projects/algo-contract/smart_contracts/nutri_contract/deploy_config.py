import logging

import algokit_utils

logger = logging.getLogger(__name__)


# Define deployment behaviour based on supplied app spec
def deploy() -> None:
    """Deploy NutriGradeSimple and run bootstrap on create/replace."""
    from smart_contracts.artifacts.nutri_contract.nutri_grade_simple_client import (
        NutriGradeSimpleFactory,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer = algorand.account.from_environment("DEPLOYER")

    # Get a typed factory bound to our generated client
    try:
        factory = algorand.client.get_typed_app_factory(
            NutriGradeSimpleFactory, default_sender=deployer.address
        )
    except AttributeError:
        # Fallback for older algokit-utils where helper may not exist
        factory = NutriGradeSimpleFactory(algorand, default_sender=deployer.address)

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    if result.operation_performed in (
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ):
        # Fund app account for min balance if newly created/replaced
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),
                sender=deployer.address,
                receiver=app_client.app_address,
            )
        )
        # Call bootstrap to initialize state/owner
        boot = app_client.send.bootstrap()
        logger.info(
            f"Bootstrap returned: {boot.abi_return}; app '{app_client.app_name}' id={app_client.app_id}"
        )

    logger.info(
        f"Deployment complete. App: {app_client.app_name} (id={app_client.app_id}) at {app_client.app_address}"
    )
