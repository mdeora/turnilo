'use strict';

import * as React from 'react/addons';
import { $, Expression, Dispatcher, Dataset } from 'plywood';
import { formatterFromData } from '../../utils/formatter';
import { DataSource, Filter, Dimension, Measure, Clicker } from "../../models/index";
// import { DateShow } from "../date-show/date-show";

var topN = 100;

interface MenuTableProps {
  dataSource: DataSource;
  filter: Filter;
  dimension: Dimension;
  showSearch: boolean;
  showCheckboxes: boolean;
  selectFilter: (newFilter: Filter, source: string) => void;
}

interface MenuTableState {
  dataset?: Dataset;
  selectedValues?: string[];
}

export class MenuTable extends React.Component<MenuTableProps, MenuTableState> {

  constructor() {
    super();
    this.state = {
      dataset: null,
      selectedValues: []
    };
  }

  fetchData(filter: Filter, dimension: Dimension) {
    var { dataSource } = this.props;
    var measure = dataSource.getSortMeasure(dimension);

    var query: any = $('main')
      .filter(filter.toExpression())
      .split(dimension.expression, dimension.name)
      .apply(measure.name, measure.expression)
      .sort($(measure.name), 'descending')
      .limit(topN + 1);

    dataSource.dispatcher(query).then((dataset) => {
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    var { filter, dimension } = this.props;
    this.fetchData(filter, dimension);
  }

  componentWillReceiveProps(nextProps: MenuTableProps) {
    var props = this.props;
    if (
      props.filter !== nextProps.filter ||
      props.dimension !== nextProps.dimension
    ) {
      this.fetchData(nextProps.filter, nextProps.dimension);
    }
  }

  componentWillUnmount() {

  }

  onBoxClick(value: any, e: MouseEvent) {
    e.stopPropagation();
    var { filter, dimension, selectFilter } = this.props;
    var { selectedValues } = this.state;
    if (selectedValues.indexOf(value) > -1) {
      selectedValues = selectedValues.filter(selectedValue => selectedValue !== value);
    } else {
      selectedValues = selectedValues.concat([value]);
    }
    this.setState({ selectedValues });
    if (selectFilter) {
      selectFilter(filter.setValues(dimension.expression, selectedValues), 'checkbox');
    }
  }

  onValueClick(value: any) {
    var { filter, dimension, selectFilter } = this.props;
    var { selectedValues } = this.state;
    this.setState({
      selectedValues: [value]
    });
    if (selectFilter) {
      selectFilter(filter.add(dimension.expression, value), 'value');
    }
  }

  render() {
    var { dataSource, dimension, showSearch, showCheckboxes } = this.props;
    var { dataset, selectedValues } = this.state;
    var measure = dataSource.getSortMeasure(dimension);

    var dimensionName = dimension.name;
    var measureName = measure.name;

    var rows: Array<React.DOMElement<any>> = [];
    var hasMore = false;
    if (dataset) {
      hasMore = dataset.data.length > topN;
      var rowData = dataset.data.slice(0, topN);
      var formatter = formatterFromData(rowData.map(d => d[measureName]), measure.format);
      rows = rowData.map((d) => {
        var segmentValue = String(d[dimensionName]);
        var measureValue = d[measureName];
        var measureValueStr = formatter(measureValue);
        var selected = selectedValues.indexOf(segmentValue) > -1;

        var checkbox: React.DOMElement<any> = null;
        if (showCheckboxes) {
          checkbox = JSX(`<div className="checkbox" onClick={this.onBoxClick.bind(this, segmentValue)}></div>`);
        }

        return JSX(`
          <div className={'row' + (selected ? ' selected' : '')} key={segmentValue}>
            <div className="segment-value" onClick={this.onValueClick.bind(this, segmentValue)}>
              {checkbox}
              <div className="label">{segmentValue}</div>
            </div>
            <div className="measure-value">{measureValueStr}</div>
          </div>
        `);
      });
    }

    var className = [
      'menu-table',
      (hasMore ? 'has-more' : 'no-more'),
      (showSearch ? 'with-search' : 'no-search')
    ].join(' ');

    var searchBar: React.DOMElement<any> = null;
    if (showSearch) {
      searchBar = JSX(`<div className="search"><input type="text" placeholder="Search"/></div>`);
    }

    return JSX(`
      <div className={className}>
        {searchBar}
        <div className="rows">{rows}</div>
      </div>
    `);
  }
}
