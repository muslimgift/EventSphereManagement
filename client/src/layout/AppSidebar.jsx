import { useCallback, useEffect, useMemo, useRef, useState, useContext } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChatIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { userContext } from "../context/UserContext";

//ADMIN PORTAL
const ExpoManagement = [
  { icon: <BoxCubeIcon />, name: "Add Expo Center", path: "/add-expo" },
  { icon: <GridIcon />,name:"Display Expo Center", path:"/eddel-expo"},
  {icon: <CalenderIcon />,name:"Add Events",path:"/add-event"},
  {icon:<CalenderIcon/>,name:"Display Events",path:"/display-event"},
   {icon:<img width="24" height="24" src="https://img.icons8.com/fluency/48/visible.png" alt="event"/>,name:"Remaining Event Locations",path:"/eventwithboothdisplay"},
  
];
const ExhibitorManagement = [
  { icon: <UserCircleIcon />, name: "Exhibitors Approval", path: "/user-approval" },
  { icon: <UserCircleIcon />, name: "Exhibitors Applications Approval", path: "/user-application" },
];


//EXHIBITOR PORTAL
const RegistrationProfileManagement=[
  { icon: <UserCircleIcon />, name: "User Profile", path: "/profile" },
  
];
const BoothSelectionAndManagement=[
{icon:<CalenderIcon/>,name:"See Future Events", path:"/eventdisplay"},
{icon:<GridIcon />,name:"See Events With Available Booth" ,path:"/eventwithboothdisplay"},
{icon:<img width="24" height="24" src="https://img.icons8.com/fluency/48/edit-user-male.png" alt="registration"/>,name:"My Registrations",path:"/registeredevents"},

];
const ScheduleManagement=[
  {icon:<GridIcon/>,name:"Add Schedule", path:"/addschedule"},
  {icon:<img width="24" height="24" src="https://img.icons8.com/arcade/64/display.png" alt="displaySchedule"/>,name:"Display Schedule", path:"/display-schedule"},
]



const navItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Anaylytics And Reporting", path: "/home", pro: false }],
  },
  {
icon:<ChatIcon/> ,name:"Chat Box",path:"/chatbox"
  },
  { icon: <CalenderIcon />, name: "Calendar", path: "/calendar" },
  
];


const AppSidebar = ({ userRole: propUserRole }) => {
  const { user } = useContext(userContext);
  const userRole = propUserRole || user?.role || "guest";

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  // Check if path is active
  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  // Define menu sections dynamically based on role
  const menuSections = useMemo(() => {
    const sections = [];
    sections.push({ section: "Main Menu", items: navItems });
    if (userRole === "organizer") {
      sections.push({ section: "Expo Management", items: ExpoManagement });
      sections.push({ section: "Exhibitor Management", items: ExhibitorManagement });
      sections.push({section: "Schedule Management",items:ScheduleManagement})
    }
    if(userRole === "exhibitors"){
      sections.push({ section: "Registration And Profile Management", items: RegistrationProfileManagement });
      sections.push({ section: "Booth Selection And Management", items: BoothSelectionAndManagement });
    }



    return sections;
  }, [userRole]);

  // Open submenu if current location matches a subitem path
  useEffect(() => {
    let submenuMatched = false;

    menuSections.forEach((section) => {
      section.items.forEach((nav, navIdx) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: section.section, index: navIdx });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, isActive, menuSections]);

  // Calculate submenu height for animation
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // Toggle submenu open/close
  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Render menu items recursively
  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {menuSections.map((section) => (
              <div key={section.section}>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    section.section
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(section.items, section.section)}
              </div>
            ))}
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;
