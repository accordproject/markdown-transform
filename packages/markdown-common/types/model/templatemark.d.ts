// Generated code for namespace: org.accordproject.templatemark@0.5.0

// imports

// Warning: Beware of circular dependencies when modifying these imports

// Warning: Beware of circular dependencies when modifying these imports

// Warning: Beware of circular dependencies when modifying these imports
import {IChild,INode} from './commonmark';
import {IDecorator} from './concerto-metamodel';
import {IConcept} from './concerto-base';

// interfaces
export enum CodeType {
  TYPESCRIPT = 'TYPESCRIPT',
  ES_2020 = 'ES_2020',
}

export interface ICode extends IConcept {
  type: CodeType;
  contents: string;
}

export interface IElementDefinition extends IChild {
  name: string;
  elementType?: string;
  decorators?: IDecorator[];
}

export type ElementDefinitionUnion = IVariableDefinition | 
IFormulaDefinition | 
IBlockDefinition;

export interface IVariableDefinition extends IElementDefinition {
  identifiedBy?: string;
}

export type VariableDefinitionUnion = IFormattedVariableDefinition | 
IEnumVariableDefinition;

export interface IFormattedVariableDefinition extends IVariableDefinition {
  format: string;
}

export interface IEnumVariableDefinition extends IVariableDefinition {
  enumValues: string[];
}

export interface IFormulaDefinition extends IElementDefinition {
  dependencies?: string[];
  code: ICode;
}

export interface IBlockDefinition extends IElementDefinition {
}

export type BlockDefinitionUnion = IClauseDefinition | 
IContractDefinition | 
IWithDefinition | 
IConditionalDefinition | 
IOptionalDefinition | 
IJoinDefinition | 
IListBlockDefinition | 
IForeachBlockDefinition | 
IWithBlockDefinition | 
IConditionalBlockDefinition | 
IOptionalBlockDefinition;

export interface IClauseDefinition extends IBlockDefinition {
  condition?: ICode;
}

export interface IContractDefinition extends IBlockDefinition {
}

export interface IWithDefinition extends IBlockDefinition {
}

export interface IConditionalDefinition extends IBlockDefinition {
  whenTrue: IChild[];
  whenFalse: IChild[];
  condition?: ICode;
  dependencies?: string[];
}

export interface IOptionalDefinition extends IBlockDefinition {
  whenSome: IChild[];
  whenNone: IChild[];
}

export interface IJoinDefinition extends IBlockDefinition {
  separator?: string;
  locale?: string;
  type?: string;
  style?: string;
}

export interface IListBlockDefinition extends IBlockDefinition {
  type: string;
  tight: string;
  start?: string;
  delimiter?: string;
}

export interface IForeachBlockDefinition extends IBlockDefinition {
}

export interface IWithBlockDefinition extends IBlockDefinition {
}

export interface IConditionalBlockDefinition extends IBlockDefinition {
  whenTrue: IChild[];
  whenFalse: IChild[];
  condition?: ICode;
}

export interface IOptionalBlockDefinition extends IBlockDefinition {
  whenSome: IChild[];
  whenNone: IChild[];
}

