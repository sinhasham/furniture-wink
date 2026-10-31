// Wink's own work photos (from the factory). Names, sizes and prices are NOT final: ask on WhatsApp.
// Each photo has a design reference (ref) so Wink can find the exact piece a customer is asking about.
export const GALLERY_CATEGORIES = Object.freeze([
  {
    "id": "beds",
    "name": "Beds"
  },
  {
    "id": "sofas",
    "name": "Sofa sets"
  },
  {
    "id": "dining",
    "name": "Dining"
  },
  {
    "id": "chairs",
    "name": "Chairs"
  },
  {
    "id": "storage",
    "name": "Wardrobes and storage"
  },
  {
    "id": "tables",
    "name": "Dressing and tables"
  },
  {
    "id": "doors",
    "name": "Doors"
  },
  {
    "id": "panels",
    "name": "Carved panels"
  }
]);

export const GALLERY = Object.freeze([
  {
    "ref": "bed-01",
    "cat": "beds",
    "alt": "Carved wooden bed with a padded headboard"
  },
  {
    "ref": "bed-02",
    "cat": "beds",
    "alt": "Carved bed with a tufted headboard"
  },
  {
    "ref": "bed-03",
    "cat": "beds",
    "alt": "Wooden bed with a carved headboard and footboard"
  },
  {
    "ref": "bed-04",
    "cat": "beds",
    "alt": "Hand-carved bed with an ornate headboard"
  },
  {
    "ref": "bed-05",
    "cat": "beds",
    "alt": "Carved bed with a storage shelf in the headboard"
  },
  {
    "ref": "bed-06",
    "cat": "beds",
    "alt": "Heavily carved bed with side drawers"
  },
  {
    "ref": "bed-07",
    "cat": "beds",
    "alt": "Wooden bed with a carved headboard"
  },
  {
    "ref": "bed-08",
    "cat": "beds",
    "alt": "Bed with a woven-pattern wooden panel"
  },
  {
    "ref": "bed-09",
    "cat": "beds",
    "alt": "Storage bed with a woven-pattern panel"
  },
  {
    "ref": "bed-10",
    "cat": "beds",
    "alt": "Bed with horizontal wooden slats"
  },
  {
    "ref": "bed-11",
    "cat": "beds",
    "alt": "Bed with a panelled headboard and footboard"
  },
  {
    "ref": "bed-12",
    "cat": "beds",
    "alt": "Dark wooden bed with carved details"
  },
  {
    "ref": "sofa-01",
    "cat": "sofas",
    "alt": "Wooden sofa set with a three-seater and armchairs"
  },
  {
    "ref": "sofa-02",
    "cat": "sofas",
    "alt": "Polished wooden three-seater sofa with slatted back"
  },
  {
    "ref": "sofa-03",
    "cat": "sofas",
    "alt": "Wooden sofa set with a centre table"
  },
  {
    "ref": "sofa-04",
    "cat": "sofas",
    "alt": "Grey tufted sofa"
  },
  {
    "ref": "dining-01",
    "cat": "dining",
    "alt": "Wooden dining table with four chairs"
  },
  {
    "ref": "dining-02",
    "cat": "dining",
    "alt": "Dining table with padded chairs"
  },
  {
    "ref": "dining-03",
    "cat": "dining",
    "alt": "Wooden dining table with a dark centre panel"
  },
  {
    "ref": "chair-01",
    "cat": "chairs",
    "alt": "Wooden chair with a slatted back"
  },
  {
    "ref": "chair-02",
    "cat": "chairs",
    "alt": "Wooden chair with a blue padded seat"
  },
  {
    "ref": "chair-03",
    "cat": "chairs",
    "alt": "Row of wooden chairs with padded seats"
  },
  {
    "ref": "chair-04",
    "cat": "chairs",
    "alt": "Wooden armchair with blue upholstery"
  },
  {
    "ref": "storage-01",
    "cat": "storage",
    "alt": "Two-door wooden cupboard with fluted doors"
  },
  {
    "ref": "storage-02",
    "cat": "storage",
    "alt": "Two-door wooden wardrobe with a carved top"
  },
  {
    "ref": "storage-03",
    "cat": "storage",
    "alt": "Wardrobe with open doors showing shelves"
  },
  {
    "ref": "storage-04",
    "cat": "storage",
    "alt": "Wooden unit with open doors and shelves"
  },
  {
    "ref": "table-01",
    "cat": "tables",
    "alt": "Dressing table with a tall mirror"
  },
  {
    "ref": "table-02",
    "cat": "tables",
    "alt": "Small wooden stool or side table"
  },
  {
    "ref": "door-01",
    "cat": "doors",
    "alt": "Carved wooden double door"
  },
  {
    "ref": "door-02",
    "cat": "doors",
    "alt": "Panelled wooden door"
  },
  {
    "ref": "door-03",
    "cat": "doors",
    "alt": "Wooden door with a carved sunburst"
  },
  {
    "ref": "door-04",
    "cat": "doors",
    "alt": "Wooden door with a carved figure"
  },
  {
    "ref": "door-05",
    "cat": "doors",
    "alt": "Wooden door with a carved figure under a tree"
  },
  {
    "ref": "door-06",
    "cat": "doors",
    "alt": "Carved wooden door panel"
  },
  {
    "ref": "panel-01",
    "cat": "panels",
    "alt": "Hand-carved wooden panel with horses"
  },
  {
    "ref": "panel-02",
    "cat": "panels",
    "alt": "Carved wooden panel with a figure scene"
  },
  {
    "ref": "panel-03",
    "cat": "panels",
    "alt": "Carved wooden panel with a flowing pattern"
  },
  {
    "ref": "panel-04",
    "cat": "panels",
    "alt": "Carved wooden name plate"
  }
].map((x) => Object.freeze({ ...x, src: `/images/gallery/${x.ref}.jpg` })));
