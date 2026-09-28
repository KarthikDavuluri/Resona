import pytest
from backend.app.data.ord.downloader import ord_downloader
from backend.app.data.ord.parser import ord_parser
from backend.app.data.ord.normalizer import ord_normalizer
from backend.app.data.ord.importer import import_ord_data

def test_ord_ingestion_pipeline():
    raw_recs = ord_downloader.fetch_sample_ord_records(count=5)
    assert len(raw_recs) == 5

    parsed = ord_parser.parse_reaction(raw_recs[0])
    assert "experiment_name" in parsed
    assert "temperature" in parsed

    normalized = ord_normalizer.normalize(parsed)
    assert normalized["normalized_temp_unit"] == "degC"

    import_res = import_ord_data(sample_size=10)
    assert "imported" in import_res
