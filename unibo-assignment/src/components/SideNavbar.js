import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/SideNavBar.css";

function SideNavbar() {
  const [width, setWidth] = useState(200);
  const [expandedItem, setExpandedItem] = useState([]);

  const navigate = useNavigate();

  const handleMouseDown = (event) => {
    const startX = event.pageX;
    const startWidth = width;

    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.pageX - startX);
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleExpand = (item) => {
    // Toggle the expansion
    if (expandedItem.includes(item)) {
      setExpandedItem((prevItems) => prevItems.filter((i) => i !== item));
    } else {
      setExpandedItem((prevItems) => [...prevItems, item]);
    }

    // Check if the item has a path and navigate
    const itemWithPath = sidebarItems.find((i) => i.name === item);
    if (itemWithPath && itemWithPath.path) {
      navigate(itemWithPath.path);
    }
  };

  const sidebarItems = [
    {
      name: "Home",
      path: "/",
      items: [
        { name: "Home 1.1", path: "/home1.1" },
        { name: "Home 1.2", path: "/home1.2" },
      ],
    },
    {
      name: "About",
      path: "/about",
      items: [
        { name: "History", path: "/about/history" },
        { name: "Team", path: "/about/team" },
      ],
    },
    {
      name: "Services",
      path: "/services",
      items: [
        { name: "Web Development", path: "/services/web" },
        { name: "Mobile Development", path: "/services/mobile" },
      ],
    },
    {
      name: "Contact",
      path: "/contact",
      items: [
        { name: "Email Us", path: "/contact/email" },
        { name: "Call Us", path: "/contact/phone" },
      ],
    },
    {
      name: "Form",
      path: "/form",
      items: [],
    },
    {
      name: "Form List",
      path: "/formlist",
      items: [],
    },
  ];

  return (
    <div className="sidebar-container">
      <div className="sidebar-content" style={{ width: `${width}px` }}>
        <h3 className="text-white">My App</h3>
        <ul className="nav flex-column mt-4">
          {sidebarItems.map((item) => (
            <li className="nav-item mb-2" key={item.name}>
              <div
                className="nav-container"
                onClick={() => handleNavigation(item.path)}
              >
                <button
                  className="btn btn-link text-white arrow-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation when clicking on the arrow
                    toggleExpand(item.name);
                  }}
                >
                  {expandedItem.includes(item.name) ? "▼" : "➤"}
                </button>
                <span className="nav-link text-white">{item.name}</span>
              </div>
              {expandedItem.includes(item.name) && (
                <ul className="nav flex-column pl-3">
                  {item.items.map((subItem) => (
                    <li
                      className="nav-item mb-2 expanded-item"
                      key={subItem.name}
                    >
                      <a
                        className="nav-link text-white"
                        onClick={() => handleNavigation(subItem.path)}
                      >
                        {subItem.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <div className="handle" onMouseDown={handleMouseDown}></div>
      </div>
    </div>
  );
}

export default SideNavbar;
