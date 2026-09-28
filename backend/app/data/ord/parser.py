import logging
from typing import Dict, Any, List

logger = logging.getLogger("resona.ord.parser")

class ORDParser:
    """
    Parses raw ORD reaction records into structured Python dicts.
    """

    def parse_reaction(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        rxn_id = raw_record.get("reaction_id", "unk_ord")
        
        # Extract Reaction SMILES or Name
        smiles = None
        rxn_name = None
        for ident in raw_record.get("identifiers", []):
            if ident.get("type") == "REACTION_SMILES":
                smiles = ident.get("value")
            elif ident.get("type") == "NAME":
                rxn_name = ident.get("value")
        
        rxn_name = rxn_name or f"ORD Reaction {rxn_id}"

        # Extract Temperature
        conds = raw_record.get("conditions", {})
        temp_obj = conds.get("temperature", {}).get("setpoint", {})
        temperature = temp_obj.get("value")
        temp_unit = temp_obj.get("units", "CELSIUS")

        # Extract Solvent & Catalyst
        inputs = raw_record.get("inputs", {})
        solvent_name = None
        catalyst_name = None
        for key, input_data in inputs.items():
            for comp in input_data.get("components", []):
                role = comp.get("role", "").upper()
                if role == "SOLVENT" or "solvent" in key.lower():
                    solvent_name = comp.get("name")
                elif role == "CATALYST" or "catalyst" in key.lower():
                    catalyst_name = comp.get("name")

        # Extract Outcomes & Yield
        outcomes = raw_record.get("outcomes", [])
        yield_val = None
        derived_status = "unknown"
        failure_desc = None

        if outcomes:
            out = outcomes[0]
            derived_status = out.get("derived_status", "unknown")
            failure_desc = out.get("failure_description")
            for prod in out.get("products", []):
                for meas in prod.get("measurements", []):
                    if meas.get("type") == "YIELD":
                        yield_val = meas.get("percentage", {}).get("value")

        return {
            "source_id": rxn_id,
            "experiment_name": rxn_name,
            "reaction_smiles": smiles,
            "temperature": temperature,
            "temp_unit": temp_unit,
            "solvent": solvent_name or "Unknown Solvent",
            "catalyst": catalyst_name or "Unknown Catalyst",
            "yield_percentage": yield_val,
            "derived_status": derived_status,
            "failure_description": failure_desc,
            "provenance": raw_record.get("provenance", {})
        }

ord_parser = ORDParser()
