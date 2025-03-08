import React from "react";
import styles from "./Layout.module.scss";
import classNames from "classnames/bind";

import Header from "../Shared/Header";

const cx = classNames.bind(styles);

const Layout = ({ children }) => {
  return (
    <div className={cx("layout")}>
      <Header />

      <div className={cx("main-content")}>{children}</div>
    </div>
  );
};

export default Layout;
