import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';

class ImportHelper {
    importsData = {};
    requireId(context, name, moduleName) {
        if (!context.program)
            throw Error('RumiousCompileError: Cannot create unique identifier !');
        const id = context.program.scope.generateUidIdentifier(name);
        if (!this.importsData[moduleName])
            this.importsData[moduleName] = {};
        if (!this.importsData[moduleName][name])
            this.importsData[moduleName][name] = {
                aliasId: id,
            };
        return this.importsData[moduleName][name].aliasId;
    }
    generateImportDec() {
        const importDec = [];
        for (const moduleName in this.importsData) {
            const names = [];
            for (const importObj in this.importsData[moduleName]) {
                names.push(t.importSpecifier(this.importsData[moduleName][importObj].aliasId, t.identifier(importObj)));
            }
            importDec.push(t.importDeclaration(names, t.stringLiteral(moduleName)));
        }
        return importDec;
    }
}

function getAttrNameAsString(attr) {
    let name = '';
    let isNamespace = false;
    if (t.isJSXIdentifier(attr.name)) {
        name = attr.name.name;
    }
    if (t.isJSXNamespacedName(attr.name)) {
        const nsp = attr.name.namespace.name;
        const rname = attr.name.name.name;
        name = `${nsp}:${rname}`;
        isNamespace = true;
    }
    return [name, isNamespace];
}
function getElementNameAsString(target) {
    if (t.isJSXIdentifier(target)) {
        return target.name;
    }
    if (t.isJSXMemberExpression(target)) {
        return `${getElementNameAsString(target.object)}.${getElementNameAsString(target.property)}`;
    }
    return '';
}
function isComponentName(name) {
    return /^[A-Z]/.test(name);
}
function getElementNameAsExpr(target) {
    if (t.isJSXIdentifier(target)) {
        return t.identifier(target.name);
    }
    if (t.isJSXMemberExpression(target)) {
        return t.memberExpression(getElementNameAsExpr(target.object), getElementNameAsExpr(target.property));
    }
    throw new Error('RumiousCompileError: Unknown element name !');
}

function getAttrAsValue(attr) {
    const value = attr.value;
    if (!value)
        return true;
    if (t.isStringLiteral(value)) {
        return value.value;
    }
    if (t.isJSXExpressionContainer(value)) {
        const expression = value.expression;
        if (t.isNullLiteral(expression)) {
            return null;
        }
        if (t.isStringLiteral(expression) ||
            t.isNumericLiteral(expression) ||
            t.isBooleanLiteral(expression)) {
            return expression.value;
        }
    }
    return undefined;
}
function getAttrValue(attr) {
    if (t.isStringLiteral(attr.value)) {
        return attr.value;
    }
    if (t.isJSXExpressionContainer(attr.value) &&
        !t.isJSXEmptyExpression(attr.value.expression)) {
        return attr.value.expression;
    }
    return t.nullLiteral();
}

const SINGLE_DIRECTIVES = ['ref', 'model', 'view'];
const DOUBLE_DIRECTIVES = ['bind', 'attr', 'on'];

function mergePrimitives(a, b) {
    const result = { ...b };
    for (const key in a) {
        if (!(key in b)) {
            result[key] = a[key];
        }
    }
    return result;
}

const traverse$1 = (typeof _traverse === 'function' ? _traverse : _traverse.default);
class ExpressionTransform {
    transform(ast) {
        const deps = new Set();
        const newAst = t.cloneNode(ast);
        function collectRoot(node) {
            if (t.isMemberExpression(node) || t.isIdentifier(node)) {
                deps.add(node);
            }
        }
        traverse$1(t.file(t.program([t.expressionStatement(newAst)])), {
            MemberExpression(path) {
                if (t.isIdentifier(path.node.property, { name: 'get' }) && !path.node.computed) {
                    collectRoot(path.node.object);
                }
            },
        }, undefined, undefined);
        return [t.arrowFunctionExpression([], newAst), deps];
    }
}

const traverse = (typeof _traverse === 'function' ? _traverse : _traverse.default);
const generate = (typeof _generate === 'function' ? _generate : _generate.default);
class Compiler {
    options;
    eventNames = [];
    environment;
    constructor(options = {}) {
        this.options = options;
        this.environment = options.environment ?? '@rumious/browser';
    }
    generateUId(context, name) {
        if (!context.program)
            throw Error('RumiousCompileError: Cannot create unique identifier !');
        const id = context.program.scope.generateUidIdentifier(name);
        return id;
    }
    transfomDirective(context, target, name, value) {
        const splitted = name.split(':');
        const dName = splitted[0];
        const dModifier = splitted[1] ?? '';
        const [exprAst, deps] = new ExpressionTransform().transform(value);
        if (dName == 'bind') {
            const reactiveCallbackFn = context.importHelper.requireId(context, 'reactiveCallback', this.environment);
            let reactiveValue = deps.size > 0 ? exprAst : value;
            //spec: reactiveCallback(context,function, value,deps=[])
            return t.expressionStatement(t.callExpression(reactiveCallbackFn, [
                context.scope.rootCtx,
                t.arrowFunctionExpression([t.identifier('value')], t.assignmentExpression('=', t.memberExpression(target, t.identifier(dModifier)), t.identifier('value')), false),
                reactiveValue,
                t.arrayExpression([...deps]),
            ]));
        }
        if (dName == 'attr') {
            const reactiveCallbackFn = context.importHelper.requireId(context, 'reactiveCallback', this.environment);
            let reactiveValue = deps.size > 0 ? exprAst : value;
            //spec: reactiveCallback(context,function, value,deps=[])
            return t.expressionStatement(t.callExpression(reactiveCallbackFn, [
                context.scope.rootCtx,
                t.arrowFunctionExpression([t.identifier('value')], t.callExpression(t.memberExpression(target, t.identifier('setAttribute')), [t.identifier('value')]), false),
                reactiveValue,
                t.arrayExpression([...deps]),
            ]));
        }
        if (dName == 'ref') {
            //spec: ref(context, element,value)
            const refFn = context.importHelper.requireId(context, 'ref', this.environment);
            return t.expressionStatement(t.callExpression(refFn, [context.scope.rootCtx, target, value]));
        }
        if (dName == 'view') {
            //spec: view(context, element,value)
            const viewFn = context.importHelper.requireId(context, 'view', this.environment);
            return t.expressionStatement(t.callExpression(viewFn, [context.scope.rootCtx, target, value]));
        }
        if (dName == 'model') {
            const detectValueChangeFn = context.importHelper.requireId(context, 'detectValueChange', this.environment);
            const setStateValueFn = context.importHelper.requireId(context, 'setStateValue', this.environment);
            return t.expressionStatement(t.callExpression(detectValueChangeFn, [
                t.arrowFunctionExpression([t.identifier('value')], t.callExpression(setStateValueFn, [value, t.identifier('value')]), false),
                target,
            ]));
        }
        if (dName == 'on') {
            const createEventFn = context.importHelper.requireId(context, 'createEvent', this.environment);
            this.eventNames.push(dModifier);
            return t.expressionStatement(t.callExpression(createEventFn, [
                context.scope.rootCtx,
                target,
                t.stringLiteral(dModifier),
                value,
            ]));
        }
        //Fallback
        const directiveObjId = context.importHelper.requireId(context, 'directives', this.environment);
        //spec: directives[<name>](context,target, modifier,value)
        return t.expressionStatement(t.callExpression(t.memberExpression(directiveObjId, t.identifier(dName)), [context.scope.rootCtx, target, t.stringLiteral(dModifier), value]));
    }
    transformJSXAttribute(context, target, attributes) {
        const compileDirective = {};
        const attributesExpr = [];
        const directiveStats = [];
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (t.isJSXAttribute(attr)) {
                const [name, isNamespace] = getAttrNameAsString(attr);
                if (isNamespace && name.split(':')[0] == 'compile') {
                    const modifier = name.split(':')[1];
                    switch (modifier) {
                        case 'preserveWhitespace':
                            compileDirective.preserveWhitespace = getAttrAsValue(attr);
                            break;
                        default:
                            throw new Error(`RumiousCompileError: Unsupported modifier '${modifier}' !`);
                    }
                    continue;
                }
                const value = getAttrValue(attr);
                if ((!isNamespace && SINGLE_DIRECTIVES.includes(name)) ||
                    (isNamespace && DOUBLE_DIRECTIVES.includes(name.split(':')[0]))) {
                    directiveStats.push(this.transfomDirective(context, target, name, value));
                }
                else {
                    attributesExpr.push(t.objectProperty(t.stringLiteral(name), value));
                }
            }
        }
        return [
            t.objectExpression(attributesExpr),
            directiveStats,
            compileDirective,
        ];
    }
    transformJSXElement(context, node) {
        const openingElement = node.openingElement;
        const attributes = openingElement.attributes;
        const name = openingElement.name;
        let isComponent = false;
        const nameStr = getElementNameAsString(name);
        if (t.isJSXIdentifier(name) && isComponentName(nameStr))
            isComponent = true;
        if (t.isJSXMemberExpression(name) &&
            isComponentName(getElementNameAsString(name.property)))
            isComponent = true;
        if (isComponent) {
            return this.transfomComponent(context, node);
        }
        //spec: element(root,context,tagName,attrs)
        const elementVar = this.generateUId(context, 'ele_');
        const elementFn = context.importHelper.requireId(context, 'element', this.environment);
        const [attrs, directives, compileDirectives] = this.transformJSXAttribute(context, elementVar, attributes);
        const elementDec = t.variableDeclaration('const', [
            t.variableDeclarator(elementVar, t.callExpression(elementFn, [
                context.scope.rootElement,
                context.scope.rootCtx,
                t.stringLiteral(nameStr),
                attrs,
            ])),
        ]);
        context.statements.push(elementDec, ...directives);
        const elementContext = {
            importHelper: context.importHelper,
            scope: {
                rootElement: elementVar,
                rootCtx: context.scope.rootCtx,
            },
            statements: [],
            program: context.program,
            compileDirectives: mergePrimitives(context.compileDirectives, compileDirectives),
        };
        if (node.children.length == 0)
            return;
        this.transformNodes(elementContext, node.children);
        context.statements.push(...elementContext.statements);
    }
    transfomFragmentComponent(context, node) {
        const openingElement = node.openingElement;
        const attributes = openingElement.attributes;
        const componentVar = this.generateUId(context, 'frag_');
        const [, , compileDirectives] = this.transformJSXAttribute(context, componentVar, attributes);
        const componentContext = {
            importHelper: context.importHelper,
            scope: {
                rootElement: context.scope.rootElement,
                rootCtx: context.scope.rootCtx,
            },
            statements: [],
            program: context.program,
            compileDirectives: mergePrimitives(context.compileDirectives, compileDirectives),
        };
        this.transformNodes(componentContext, node.children);
        context.statements.push(...componentContext.statements);
    }
    transfomIfComponent(context, node) {
        const openingElement = node.openingElement;
        const attributes = openingElement.attributes;
        const componentFn = context.importHelper.requireId(context, 'createIfComponent', this.environment);
        const componentVar = this.generateUId(context, 'if_comp_');
        const [props, ,] = this.transformJSXAttribute(context, componentVar, attributes);
        const componentDec = t.variableDeclaration('const', [
            t.variableDeclarator(componentVar, t.callExpression(componentFn, [
                context.scope.rootElement,
                context.scope.rootCtx,
                props,
            ])),
        ]);
        context.statements.push(componentDec);
    }
    transfomForComponent(context, node) {
        const openingElement = node.openingElement;
        const attributes = openingElement.attributes;
        const componentFn = context.importHelper.requireId(context, 'createForComponent', this.environment);
        const componentVar = this.generateUId(context, 'for_comp_');
        const [props, ,] = this.transformJSXAttribute(context, componentVar, attributes);
        const componentDec = t.variableDeclaration('const', [
            t.variableDeclarator(componentVar, t.callExpression(componentFn, [
                context.scope.rootElement,
                context.scope.rootCtx,
                props,
            ])),
        ]);
        context.statements.push(componentDec);
    }
    transfomComponent(context, node) {
        const openingElement = node.openingElement;
        const attributes = openingElement.attributes;
        const nameStr = getElementNameAsString(openingElement.name);
        if (nameStr === 'If') {
            return this.transfomIfComponent(context, node);
        }
        if (nameStr === 'For') {
            return this.transfomForComponent(context, node);
        }
        if (nameStr === 'Fragment') {
            return this.transfomFragmentComponent(context, node);
        }
        const name = getElementNameAsExpr(openingElement.name);
        const componentFn = context.importHelper.requireId(context, 'createComponent', this.environment);
        const componentVar = this.generateUId(context, 'comp_');
        const [props, , compileDirectives] = this.transformJSXAttribute(context, componentVar, attributes);
        const componentDec = t.variableDeclaration('const', [
            t.variableDeclarator(componentVar, t.callExpression(componentFn, [
                context.scope.rootElement,
                context.scope.rootCtx,
                name,
                props,
            ])),
        ]);
        context.statements.push(componentDec);
        if (node.children.length == 0)
            return;
        const componentContext = {
            importHelper: context.importHelper,
            scope: {
                rootElement: this.generateUId(context, 'root'),
                rootCtx: this.generateUId(context, 'ctx'),
            },
            statements: [],
            program: context.program,
            compileDirectives: mergePrimitives(context.compileDirectives, compileDirectives),
        };
        const createRootFragStat = t.variableDeclaration('const', [
            t.variableDeclarator(componentContext.scope.rootElement, t.callExpression(t.memberExpression(t.identifier('document'), t.identifier('createDocumentFragment')), [])),
        ]);
        this.transformNodes(componentContext, node.children);
        const setSlotCall = t.expressionStatement(t.callExpression(t.memberExpression(componentVar, t.identifier('setSlot')), [
            t.arrowFunctionExpression([componentContext.scope.rootCtx], t.blockStatement([
                createRootFragStat,
                ...componentContext.statements,
                t.returnStatement(componentContext.scope.rootElement),
            ]), false),
        ]));
        context.statements.push(setSlotCall);
    }
    transformNodes(context, nodes) {
        let textBuffer = '';
        const appendTextFn = context.importHelper.requireId(context, 'appendText', this.environment);
        const flushText = () => {
            if (textBuffer !== '') {
                context.statements.push(t.expressionStatement(t.callExpression(appendTextFn, [
                    context.scope.rootElement,
                    t.stringLiteral(textBuffer),
                ])));
            }
            textBuffer = '';
        };
        const preserveWhitespace = context.compileDirectives.preserveWhitespace;
        for (const node of nodes) {
            if (t.isJSXText(node)) {
                let text = node.value;
                switch (preserveWhitespace) {
                    case true:
                        break;
                    case 'smart':
                        text = text
                            .replace(/[ \t]*\n[ \t]*/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                        break;
                    default:
                        text = text.replace(/\s+/g, ' ').trim();
                }
                textBuffer += text;
            }
            else {
                flushText();
                if (t.isJSXElement(node)) {
                    this.transformJSXElement(context, node);
                }
                else if (t.isJSXExpressionContainer(node)) {
                    this.transformJSXExpressionContainer(context, node);
                }
                else if (t.isJSXFragment(node)) {
                    this.transformNodes(context, node.children);
                }
            }
        }
        flushText();
    }
    transformJSXExpressionContainer(context, node) {
        const expression = node.expression;
        if (t.isJSXEmptyExpression(expression))
            return;
        const reactivePartFn = context.importHelper.requireId(context, 'reactivePart', this.environment);
        let [exprAst, deps] = new ExpressionTransform().transform(expression);
        let newExpr = deps.size > 0 ? exprAst : expression;
        const appendDynamicValueStat = t.expressionStatement(t.callExpression(reactivePartFn, [
            context.scope.rootCtx,
            context.scope.rootElement,
            newExpr,
            t.arrayExpression([...deps]),
        ]));
        context.statements.push(appendDynamicValueStat);
    }
    transformAst(ast) {
        const context = {
            importHelper: new ImportHelper(),
            scope: {
                rootElement: t.identifier(`root_${Date.now()}`),
                rootCtx: t.identifier(`ctx_${Date.now()}`),
            },
            statements: [],
            compileDirectives: {
                preserveWhitespace: true,
            },
        };
        traverse(ast, {
            Program: (path) => {
                context.program = path;
                context.scope.rootElement = this.generateUId(context, 'root');
                context.scope.rootCtx = this.generateUId(context, 'ctx');
            },
            JSXAttribute: (path) => {
                console.log(path);
            },
            JSXElement: (path) => {
                const localContext = {
                    importHelper: context.importHelper,
                    scope: {
                        rootElement: this.generateUId(context, 'root'),
                        rootCtx: this.generateUId(context, 'ctx'),
                    },
                    statements: [],
                    program: context.program,
                    compileDirectives: {
                        preserveWhitespace: true,
                    },
                };
                this.transformJSXElement(localContext, path.node);
                const createRootFragStat = t.variableDeclaration('const', [
                    t.variableDeclarator(localContext.scope.rootElement, t.callExpression(t.memberExpression(t.identifier('document'), t.identifier('createDocumentFragment')), [])),
                ]);
                const template = t.arrowFunctionExpression([localContext.scope.rootCtx], t.blockStatement([
                    createRootFragStat,
                    ...localContext.statements,
                    t.returnStatement(localContext.scope.rootElement),
                ]));
                path.replaceWith(template);
            },
        });
        const eventDelegateFn = context.importHelper.requireId(context, 'eventDelegate', this.environment);
        const eventNameStrLiterals = t.arrayExpression(this.eventNames.map((name) => t.stringLiteral(name)));
        const eventDelegateStat = t.expressionStatement(t.callExpression(eventDelegateFn, [eventNameStrLiterals]));
        ast.program.body.push(eventDelegateStat);
        ast.program.body.unshift(...context.importHelper.generateImportDec());
    }
    compile(code, metadata) {
        const filename = metadata.filename;
        const isTSX = filename.endsWith('.tsx');
        const isTS = filename.endsWith('.ts') || isTSX;
        const plugins = ['jsx'];
        if (isTS || isTSX)
            plugins.push('typescript');
        const ast = parser.parse(code, {
            sourceType: metadata.type,
            ranges: true,
            plugins,
        });
        this.transformAst(ast);
        const compiled = generate(ast, {
            comments: false,
            concise: false,
            compact: false,
            sourceMaps: true,
            sourceFileName: metadata.filename,
            jsescOption: { minimal: true },
        }, code);
        return {
            code: compiled.code,
            map: compiled.map,
        };
    }
}

export { Compiler };
//# sourceMappingURL=index.js.map