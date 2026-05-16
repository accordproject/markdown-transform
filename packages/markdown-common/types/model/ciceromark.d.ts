// Generated code for namespace: org.accordproject.ciceromark@0.6.0

// imports

// Warning: Beware of circular dependencies when modifying these imports

// Warning: Beware of circular dependencies when modifying these imports

// Warning: Beware of circular dependencies when modifying these imports
import {IChild,INode} from './commonmark';
import {IDecorator} from './concerto-metamodel';

// interfaces
export interface IElement extends IChild {
  name: string;
  elementType?: string;
  decorators?: IDecorator[];
}

export type ElementUnion = IVariable | 
IFormula | 
IBlock;

export interface IVariable extends IElement {
  value: string;
  identifiedBy?: string;
}

export type VariableUnion = IFormattedVariable | 
IEnumVariable;

export interface IFormattedVariable extends IVariable {
  format: string;
}

export interface IEnumVariable extends IVariable {
  enumValues: string[];
}

export interface IFormula extends IElement {
  value: string;
  dependencies?: string[];
  code?: string;
}

export interface IBlock extends IElement {
}

export type BlockUnion = IClause | 
IContract | 
IConditional | 
IOptional | 
IListBlock;

export interface IClause extends IBlock {
  src?: string;
}

export interface IContract extends IBlock {
  src?: string;
}

export interface IConditional extends IBlock {
  isTrue: boolean;
  whenTrue: IChild[];
  whenFalse: IChild[];
}

export interface IOptional extends IBlock {
  hasSome: boolean;
  whenSome: IChild[];
  whenNone: IChild[];
}

export interface IListBlock extends IBlock {
  type: string;
  tight: string;
  start?: string;
  delimiter?: string;
}

