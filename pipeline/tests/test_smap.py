import io
import unittest

from PIL import Image

from pipeline.download.smap import parse_colormap, sample_days, tile_pixel, value_at
from pipeline.summarize.smap import summer_smap

XML = """<ColorMaps><ColorMap title="No Data"><Entries>
<ColorMapEntry rgb="0,0,0" transparent="true" sourceValue="[-9999]" value="[-9999]" nodata="true" ref="0"/>
</Entries></ColorMap><ColorMap title="Soil Moisture"><Entries>
<ColorMapEntry rgb="255,162,0" transparent="false" sourceValue="[0.000,0.003)" value="[0.000,0.003)" ref="1"/>
<ColorMapEntry rgb="0,205,155" transparent="false" sourceValue="[0.300,0.303)" value="[0.300,0.303)" ref="2"/>
<ColorMapEntry rgb="80,80,80" transparent="false" sourceValue="[0.700,+INF)" value="[0.700,+INF)" ref="3"/>
</Entries></ColorMap></ColorMaps>"""


def tile(color, alpha=255):
    image = Image.new("RGBA", (256, 256), color + (alpha,))
    buffer = io.BytesIO()
    image.save(buffer, "PNG")
    return buffer.getvalue()


class ColorMapTest(unittest.TestCase):
    def test_each_color_maps_to_the_middle_of_its_range(self):
        colors = parse_colormap(XML)
        self.assertEqual(colors[(255, 162, 0)], 0.0015)
        self.assertEqual(colors[(0, 205, 155)], 0.3015)
        self.assertEqual(colors[(80, 80, 80)], 0.7015)  # the open-ended last step

    def test_no_data_color_is_left_out(self):
        self.assertNotIn((0, 0, 0), parse_colormap(XML))


class TileTest(unittest.TestCase):
    def test_the_climate_point_falls_in_the_tile_checked_by_hand(self):
        # McLean County at zoom 6 is tile x=16, y=24 (checked against the WMTS tile grid).
        found = tile_pixel(40.284, -88.6594, 6)
        self.assertEqual((found["x"], found["y"]), (16, 24))
        self.assertTrue(0 <= found["px"] < 256 and 0 <= found["py"] < 256)

    def test_value_comes_from_the_color_under_the_pixel(self):
        colors = parse_colormap(XML)
        pixel = {"px": 10, "py": 10}
        self.assertEqual(value_at(tile((0, 205, 155)), pixel, colors), 0.3015)

    def test_transparent_or_unknown_color_is_none_not_zero(self):
        colors = parse_colormap(XML)
        pixel = {"px": 10, "py": 10}
        self.assertIsNone(value_at(tile((0, 205, 155), alpha=0), pixel, colors))
        self.assertIsNone(value_at(tile((1, 2, 3)), pixel, colors))


class SamplingTest(unittest.TestCase):
    def test_a_summer_has_fourteen_weekly_samples(self):
        days = sample_days(2023)
        self.assertEqual(len(days), 14)
        self.assertEqual((days[0].month, days[0].day), (6, 1))
        self.assertLessEqual(days[-1].month, 8)


class SummerMeanTest(unittest.TestCase):
    def test_mean_of_the_weekly_samples(self):
        samples = [{"date": "d", "value": 0.30}] * 7 + [{"date": "d", "value": 0.34}] * 7
        self.assertEqual(summer_smap(samples), 0.32)

    def test_too_few_samples_is_unknown_not_a_mean(self):
        self.assertIsNone(summer_smap([{"date": "d", "value": 0.3}] * 5))


if __name__ == "__main__":
    unittest.main()
