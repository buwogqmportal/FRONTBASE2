export type APISpace = {
  space_ID: string;
  project_ID: string;
  project_title: string;
  space_title: string;
  space_status: string;
  space_type: string;
  space_data: {
    buildingunitnr: string;
    city: string;
    space_building: string;
    space_floor: string;
    position: string;
    garden_area: string;
    loggia_area: string;
    space_layout: string;
  };
};
