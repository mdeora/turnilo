'use strict';

import { List, IndexedIterable } from 'immutable';
import * as React from 'react/addons';
import { Timezone, WallTime } from "chronology";
import { $, Expression, Datum, Dataset, TimeRange } from 'plywood';

import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource } from "./models/index";
import { Application } from "./components/index";

// Init chronology
if (!WallTime.rules) {
  var tzData = require("chronology/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

var dataSources = List([
  DataSource.fromDataURL('wiki', 'Wikipedia', '/data/wikipedia.json')
  //DataSource.fromDispatcher('wiki2', 'Wikipedia 2', wikiRawData)
]);

React.render(
  React.createElement(Application, {
    dataSources: dataSources
  }),
  document.body
);
