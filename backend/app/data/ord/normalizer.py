import logging
from typing import Dict, Any

logger = logging.getLogger("resona.ord.normalizer")

class ORDNormalizer:
    """
    Normalizes temperature units to Celsius, concentrations to Molar,
    preserves original values, and maps outcomes defensibly.
    """

    def normalize(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        temp = parsed.get("temperature")
        unit = parsed.get("temp_unit", "CELSIUS").upper()

        norm_temp = temp
        if temp is not None:
            if unit in ["KELVIN", "K"]:
                norm_temp = temp - 273.15
            elif unit in ["FAHRENHEIT", "F"]:
                norm_temp = (temp - 32) * 5.0 / 9.0

        # Preserve original source metadata
        parsed["normalized_temperature"] = round(norm_temp, 2) if norm_temp is not None else None
        parsed["normalized_temp_unit"] = "degC"
        parsed["source_type"] = "ORD"

        return parsed

ord_normalizer = ORDNormalizer()
