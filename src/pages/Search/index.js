import React, { Component } from 'react';
import classNames from 'classnames';
import Search from '../../component/Search';
import searchdb from '../../source/search.json';
import styles from './index.less';

export default class SearchView extends Component {
  static typeName = 'search';
  constructor(props) {
    super(props);
    this.state = {
      searchNav: searchdb || [],
      select: props.conf.selectType,
      value: props.conf.selectSubType,
      iframe: false,
      iframeUrl: '',
      query: '',
    };
  }
  onClick(item) {
    const { storage, conf } = this.props;
    conf.selectType = item.value;
    storage.set({ conf });
    this.setState({ select: item.value, iframeUrl: '' }, () => {
      if (item.children && item.children.length > 0) {
        const value = item.children[0].value;
        conf.selectSubType = value;
        storage.set({ conf });
        this.setState({ value });
      }
    });
  }
  onClickSubTab(item) {
    if (item.target === '_blank') {
      return window.open(item.url);
    }
    const { storage, conf } = this.props;
    conf.selectSubType = item.value;
    storage.set({ conf });
    this.setState({ value: item.value });
  }
  getSubNavData() {
    const { select, searchNav } = this.state;
    const menu = searchNav.filter(item => item.value === select);
    if (menu && menu.length > 0) {
      return menu[0].children || [];
    }
    return [];
  }
  onSearch(item) {
    this.isSreach = false;
    // const { query } = this.state;
    const { query } = this.state;
    const iframeUrl = item.url.replace(/\{\{.*\}\}/, query);
    // console.log('===>', iframeUrl);
    if (item.iframe === false) {
      return window.open(iframeUrl);
    }
    this.setState({ iframe: true, iframeUrl });
  }
  onChange(e) {
    this.isSreach = true;
    this.setState({ query: e.target.value });
  }
  onSelect(item) {
    const { query } = this.state;
    if (item.target === '_blank') {
      item.url = item.url.replace(/\{\{.*\}\}/, query);
      return window.open(item.url);
    }

    const { storage, conf } = this.props;
    conf.selectSubType = item.value;
    storage.set({ conf });

    if (item.iframe === false) {
      this.isSreach = true;
      this.setState({
        iframeUrl: '',
      });
    }
    this.setState({ value: item.value });
  }
  render() {
    const { select, value, query, searchNav, iframe, iframeUrl } = this.state;
    const option = this.getSubNavData();
    const optionMenu = searchNav.filter(item => item.value === select)[0] || {};
    const optionItem = option.filter(item => item.value === value)[0] || option[0];
    const url = (optionItem.url || '').replace(/\{\{.*\}\}/, query);
    const isTab = optionMenu && optionMenu.reveal && optionMenu.reveal === 'tab';
    const TabView = (
      <div className={styles.tabBar}>
        {option.map((item, idx) => (
          <div key={idx} onClick={this.onClickSubTab.bind(this, item)} className={classNames({ active: item.value === value })}>{item.label}</div>
        ))}
      </div>
    );
    return (
      <div className={classNames(styles.warpper, { [`${styles.warpperFrame}`]: ((optionItem.iframe !== false && query && !this.isSreach) || iframeUrl || optionMenu.reveal === 'tab') })}>
        <div className={styles.topNav}>
          {searchNav.map((item, idx) => (
            <div className={classNames({ active: item.value === select })} key={idx} onClick={this.onClick.bind(this, item)}>
              {item.label}
            </div>
          ))}
        </div>
        {isTab && TabView}
        {!isTab && (
          <div className={classNames(styles.content)}>
            <Search
              autoFocus
              placeholder="请输入文字"
              query={query}
              onChange={this.onChange.bind(this)}
              onSearch={this.onSearch.bind(this, optionItem)}
              select={{
                option,
                value,
                onSelect: this.onSelect.bind(this),
              }}
            />
          </div>
        )}
        {((optionItem.iframe !== false && query && !this.isSreach) || iframeUrl || optionMenu.reveal === 'tab') && (
          <div className={styles.iframe}>
            <iframe title={optionItem.label} name="ifrm" src={iframeUrl || url} framespacing="0" frameBorder="NO" scrolling="yes" width="100%" height="100%" noresize="" />
          </div>
        )}
      </div>
    );
  }
}