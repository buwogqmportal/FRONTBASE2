<script lang="ts">
  import AddIcon from '$icons/add.svg?component';
  import AirconIcon from '$icons/aircon.svg?component';
  import ArrowBigIcon from '$icons/arrow_big.svg?component';
  import ArrowFilledDownIcon from '$icons/arrow_filled_down.svg?component';
  import ArrowFilledTopIcon from '$icons/arrow_filled_top.svg?component';
  import ArrowIcon from '$icons/arrow.svg?component';
  import AttachIcon from '$icons/attach.svg?component';
  import BalconyIcon from '$icons/balcony.svg?component';
  import BasementIcon from '$icons/basement.svg?component';
  import BathroomIcon from '$icons/bathroom.svg?component';
  import BedroomIcon from '$icons/bedroom.svg?component';
  import CalendarIcon from '$icons/calendar.svg?component';
  import CeilingIcon from '$icons/ceiling.svg?component';
  import ChatContactClientIcon from '$icons/chat_contact_client.svg?component';
  import ChatContactFirmIcon from '$icons/chat_contact_firm.svg?component';
  import ChatContactIcon from '$icons/chat_contact.svg?component';
  import CheckmarkIcon from '$icons/checkmark.svg?component';
  import CloseIcon from '$icons/close.svg?component';
  import CommunityIcon from '$icons/community.svg?component';
  import ContactIcon from '$icons/contact.svg?component';
  import CopyIcon from '$icons/copy.svg?component';
  import Corridor2Icon from '$icons/corridor2.svg?component';
  import CorridorIcon from '$icons/corridor.svg?component';
  import DashboardIcon from '$icons/dashboard.svg?component';
  import DocumentIcon from '$icons/document.svg?component';
  import DoorIcon from '$icons/door.svg?component';
  import DownloadIcon from '$icons/download.svg?component';
  import EditIcon from '$icons/edit.svg?component';
  import ElectricIcon from '$icons/electric.svg?component';
  import FacadeIcon from '$icons/facade.svg?component';
  import FanIcon from '$icons/fan.svg?component';
  import FilterIcon from '$icons/filter.svg?component';
  import FingerprintIcon from '$icons/fingerprint.svg?component';
  import FloorIcon from '$icons/floor.svg?component';
  import FloormapIcon from '$icons/floormap.svg?component';
  import GarbageIcon from '$icons/garbage.svg?component';
  import GateIcon from '$icons/gate.svg?component';
  import HandrailIcon from '$icons/handrail.svg?component';
  import HappyIcon from '$icons/happy.svg?component';
  import HeatingIcon from '$icons/heating.svg?component';
  import InsideIcon from '$icons/inside.svg?component';
  import KitchenIcon from '$icons/kitchen.svg?component';
  import LightIcon from '$icons/light.svg?component';
  import LivingroomIcon from '$icons/livingroom.svg?component';
  import MailIcon from '$icons/mail.svg?component';
  import MenuIcon from '$icons/menu.svg?component';
  import MessageIcon from '$icons/message.svg?component';
  import MilestoneIcon from '$icons/milestone.svg?component';
  import OtherIcon from '$icons/other.svg?component';
  import OutdoorIcon from '$icons/outdoor.svg?component';
  import OutsideIcon from '$icons/outside.svg?component';
  import PaperplaneIcon from '$icons/paperplane.svg?component';
  import ParkIcon from '$icons/park.svg?component';
  import PhoneIcon from '$icons/phone.svg?component';
  import PipeIcon from '$icons/pipe.svg?component';
  import PlayIcon from '$icons/play.svg?component';
  import ProjectBigIcon from '$icons/project_big.svg?component';
  import ProjectIcon from '$icons/project.svg?component';
  import RemovableIcon from '$icons/removable.svg?component';
  import RequestIcon from '$icons/request.svg?component';
  import RoofIcon from '$icons/roof.svg?component';
  import RoomOneIcon from '$icons/roomone.svg?component';
  import RoomTwoIcon from '$icons/roomtwo.svg?component';
  import SanitaryIcon from '$icons/sanitary.svg?component';
  import SearchIcon from '$icons/search.svg?component';
  import SettingsIcon from '$icons/settings.svg?component';
  import ShowerroomIcon from '$icons/showerroom.svg?component';
  import SortableIcon from '$icons/sortable.svg?component';
  import StaffIcon from '$icons/staff.svg?component';
  import StaircaseIcon from '$icons/staircase.svg?component';
  import StorageroomIcon from '$icons/storageroom.svg?component';
  import StrollerIcon from '$icons/stroller.svg?component';
  import TechnicIcon from '$icons/technic.svg?component';
  import ToiletteIcon from '$icons/toilette.svg?component';
  import ToiletteTwoIcon from '$icons/toilettetwo.svg?component';
  import ToolbagBigIcon from '$icons/toolbag_big.svg?component';
  import ToolbagIcon from '$icons/toolbag.svg?component';
  import ToolsIcon from '$icons/tools.svg?component';
  import UndoIcon from '$icons/undo.svg?component';
  import UparkingIcon from '$icons/uparking.svg?component';
  import UserIcon from '$icons/user.svg?component';
  import UtilityIcon from '$icons/utility.svg?component';
  import ViewIcon from '$icons/view.svg?component';
  import WalkIcon from '$icons/walk.svg?component';
  import WallIcon from '$icons/wall.svg?component';
  import WindowIcon from '$icons/window.svg?component';

  export let iconPath = '';
  export { class_ as class };

  let class_ = '';

  const icons = {
    add: AddIcon,
    aircon: AirconIcon,
    arrow: ArrowIcon,
    arrowBig: ArrowBigIcon,
    arrowFilledDown: ArrowFilledDownIcon,
    arrowFilledTop: ArrowFilledTopIcon,
    attach: AttachIcon,
    balcony: BalconyIcon,
    basement: BasementIcon,
    bathroom: BathroomIcon,
    bedroom: BedroomIcon,
    calendar: CalendarIcon,
    ceiling: CeilingIcon,
    chatContact: ChatContactIcon,
    chatContactClient: ChatContactClientIcon,
    chatContactFirm: ChatContactFirmIcon,
    checkmark: CheckmarkIcon,
    close: CloseIcon,
    community: CommunityIcon,
    contact: ContactIcon,
    copy: CopyIcon,
    corridor: CorridorIcon,
    corridor2: Corridor2Icon,
    dashboard: DashboardIcon,
    document: DocumentIcon,
    door: DoorIcon,
    download: DownloadIcon,
    edit: EditIcon,
    electric: ElectricIcon,
    facade: FacadeIcon,
    fan: FanIcon,
    filter: FilterIcon,
    fingerprint: FingerprintIcon,
    floor: FloorIcon,
    floormap: FloormapIcon,
    garbage: GarbageIcon,
    gate: GateIcon,
    handrail: HandrailIcon,
    happy: HappyIcon,
    heating: HeatingIcon,
    inside: InsideIcon,
    kitchen: KitchenIcon,
    light: LightIcon,
    livingroom: LivingroomIcon,
    mail: MailIcon,
    menu: MenuIcon,
    message: MessageIcon,
    milestone: MilestoneIcon,
    other: OtherIcon,
    outdoor: OutdoorIcon,
    outside: OutsideIcon,
    paperplane: PaperplaneIcon,
    park: ParkIcon,
    phone: PhoneIcon,
    pipe: PipeIcon,
    play: PlayIcon,
    project_big: ProjectBigIcon,
    project: ProjectIcon,
    removable: RemovableIcon,
    request: RequestIcon,
    roof: RoofIcon,
    roomone: RoomOneIcon,
    roomtwo: RoomTwoIcon,
    sanitary: SanitaryIcon,
    search: SearchIcon,
    settings: SettingsIcon,
    showerroom: ShowerroomIcon,
    sortable: SortableIcon,
    staff: StaffIcon,
    staircase: StaircaseIcon,
    storageroom: StorageroomIcon,
    stroller: StrollerIcon,
    technic: TechnicIcon,
    toilette: ToiletteIcon,
    toilettetwo: ToiletteTwoIcon,
    toolbag_big: ToolbagBigIcon,
    toolbag: ToolbagIcon,
    tools: ToolsIcon,
    undo: UndoIcon,
    uparking: UparkingIcon,
    user: UserIcon,
    utility: UtilityIcon,
    view: ViewIcon,
    walk: WalkIcon,
    wall: WallIcon,
    window: WindowIcon,
  };
</script>

{#if icons[iconPath]}
  <svelte:component this={icons[iconPath]} class={class_} />
{/if}
