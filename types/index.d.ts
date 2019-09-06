// TypeScript Version: 3.5

import { Component } from 'react';

/**
 * getDataFromTree
 */

export interface defaultQueryInfo {
  seen: boolean;
  observerable: null;
}

export function makeDefaultQueryInfo(): defaultQueryInfo;

export function getDataFromTree(tree: any, context: any): any;

export function getMarkupFromTree(tree: any, context: any, renderFunction: () => void): Promise<any>;

/**
 * RenderPromises
 */

export interface QueryInfo {
  seen: boolean;
  observable: Promise<any> | null;
}

export interface QueryMap {
  [key: string]: any;
}

export class RenderPromises {
  queryPromises: QueryMap;
  queryInfoTrie: QueryMap;
  registerSSRObservable(queryInstance: Component, observable: Promise<any>): void;
  getSSRObservable(queryInstance: Component): Promise<any>;
  addQueryPromise(queryInstance: Component, finish: () => void): any;
  hasPromises(): boolean;
  consumeAndAwait(): Promise<any>;
  lookupQueryInfo(queryInstance: Component): QueryInfo;
}
