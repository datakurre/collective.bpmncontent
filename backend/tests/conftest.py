from pytest_plone import fixtures_factory
from collective.bpmncontent.testing import ACCEPTANCE_TESTING
from collective.bpmncontent.testing import FUNCTIONAL_TESTING
from collective.bpmncontent.testing import INTEGRATION_TESTING


pytest_plugins = ["pytest_plone"]


globals().update(
    fixtures_factory(
        (
            (ACCEPTANCE_TESTING, "acceptance"),
            (FUNCTIONAL_TESTING, "functional"),
            (INTEGRATION_TESTING, "integration"),
        )
    )
)
