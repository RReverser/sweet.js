(function (root, factory) {
    'use strict';
    if (// Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
        // Rhino.
        typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander',
            'acorn'
        ], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports, require('./expander'), require('acorn'));
    }
}(this, function (exports$2, expander, acorn) {
    'use strict';
    var tt, Token, Messages, Regex, comments, t;
    tt = acorn.tokTypes;
    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        RegularExpression: 9,
        Template: 10,
        Delimiter: 11
    };
    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken: 'Unexpected token %0',
        UnexpectedNumber: 'Unexpected number',
        UnexpectedString: 'Unexpected string',
        UnexpectedIdentifier: 'Unexpected identifier',
        UnexpectedTemplate: 'Unexpected quasi %0',
        UnexpectedEOS: 'Unexpected end of input',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp: 'Invalid regular expression: missing /'
    };
    // See also tools/generate-unicode-regex.py.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
    };
    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }
    function isIn(el, list) {
        return list.indexOf(el) !== -1;
    }
    function isFutureReservedWord(id) {
        switch (id) {
        case 'class':
        case 'enum':
        case 'export':
        case 'extends':
        case 'import':
        case 'super':
            return true;
        default:
            return false;
        }
    }
    function advance() {
        var token = t.getToken();
        var type = token.type;
        var start = token.loc.start;
        var value = token.value;
        var isKeyword = !!token.keyword;
        switch (type) {
        case tt.name:
            type = Token.Identifier;
            break;
        case tt.semi:
        case tt.comma:
        case tt.parenL:
        case tt.parenR:
        case tt.braceL:
        case tt.braceR:
        case tt.slash:
        case tt.dot:
        case tt.bracketL:
        case tt.bracketR:
        case tt.ellipsis:
        case tt.arrow:
        case tt.star:
        case tt.incDec:
        case tt.colon:
        case tt.question:
        case tt.template:
        case tt.backQuote:
        case tt.dollarBraceL:
        case tt.at:
        case tt.logicalOR:
        case tt.logicalAND:
        case tt.bitwiseOR:
        case tt.bitwiseXOR:
        case tt.bitwiseAND:
        case tt.equality:
        case tt.relational:
        case tt.bitShift:
        case tt.plusMin:
        case tt.modulo:
        case tt.exponent:
        case tt.prefix:
        case tt.doubleColon:
            value = value || type.label;
            type = Token.Punctuator;
            break;
        case tt.jsxTagStart:
            type = Token.Punctuator;
            value = '<';
            break;
        case tt.jsxTagEnd:
            type = Token.Punctuator;
            value = '>';
            break;
        case tt.jsxName:
            type = Token.Identifier;
            // "JSXIdentifier";
            break;
        case tt.jsxText:
            type = Token.StringLiteral;
            // "JSXText";
            break;
        case tt._null:
            type = Token.NullLiteral;
            break;
        case tt._false:
        case tt._true:
            type = Token.BooleanLiteral;
            break;
        case tt.num:
            type = Token.NumericLiteral;
            value = String(value);
            break;
        case tt.string:
            type = Token.StringLiteral;
            value = JSON.stringify(value);
            break;
        case tt.regexp:
            type = Token.RegularExpression;
            break;
        case tt.eof:
            type = Token.EOF;
            break;
        default:
            if (type.isAssign) {
                if (!value)
                    value = type.label;
                type = Token.Punctuator;
            } else if (type.keyword) {
                type = Token.Keyword;
            } else {
                var found = false;
                for (var tokenTypeName in tt) {
                    if (type === tt[tokenTypeName]) {
                        found = true;
                        break;
                    }
                }
                throw new TypeError('Unknown token type (' + start.line + ':' + start.column + '): ' + (found ? tokenTypeName : '<unknown>'));
            }
        }
        token = {
            type: type,
            _isKeyword: isKeyword,
            lineNumber: start.line,
            lineStart: start.column,
            range: token.range
        };
        if (type === Token.RegularExpression) {
            token.value = String(value.value);
            token.regex = {
                pattern: value.pattern,
                flags: value.flags
            };
        } else {
            token.value = value;
        }
        return token;
    }
    function throwError(token, messageFormat) {
        var error, args = Array.prototype.slice.call(arguments, 2), msg = messageFormat.replace(/%(\d)/g, function (whole, index$2) {
                assert(index$2 < args.length, 'Message reference must be in range');
                return args[index$2];
            });
        var toks = '', tailingMsg = '';
        if (typeof token.lineNumber === 'number') {
            error = new Error('Line ' + token.lineNumber + ': ' + msg + tailingMsg);
            error.index = token.range[0];
            error.lineNumber = token.lineNumber;
            error.column = token.range[0] - t.lineStart + 1;
        } else {
            error = new Error('Line ' + t.curLine + ': ' + msg + tailingMsg);
            error.index = index;
            error.lineNumber = t.curLine;
            error.column = index - t.lineStart + 1;
        }
        error.description = msg;
        throw error;
    }
    function throwUnexpected(token) {
        if (token.type === Token.EOF) {
            throwError(token, Messages.UnexpectedEOS);
        }
        if (token.type === Token.NumericLiteral) {
            throwError(token, Messages.UnexpectedNumber);
        }
        if (token.type === Token.StringLiteral) {
            throwError(token, Messages.UnexpectedString);
        }
        if (token.type === Token.Identifier) {
            throwError(token, Messages.UnexpectedIdentifier);
        }
        if (token.type === Token.Keyword) {
            if (isFutureReservedWord(token.value)) {
            }
            throwError(token, Messages.UnexpectedToken, token.value);
        }
        if (token.type === Token.Template) {
            throwError(token, Messages.UnexpectedTemplate, token.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError(token, Messages.UnexpectedToken, token.value);
    }
    function blockAllowed(toks, start, inExprDelim, parentIsBlock) {
        var assignOps = [
            '=',
            '+=',
            '-=',
            '*=',
            '/=',
            '%=',
            '<<=',
            '>>=',
            '>>>=',
            '&=',
            '|=',
            '^=',
            ','
        ];
        var binaryOps = [
            '+',
            '-',
            '*',
            '/',
            '%',
            '<<',
            '>>',
            '>>>',
            '&',
            '|',
            '^',
            '&&',
            '||',
            '?',
            ':',
            '===',
            '==',
            '>=',
            '<=',
            '<',
            '>',
            '!=',
            '!==',
            'instanceof'
        ];
        var unaryOps = [
            '++',
            '--',
            '~',
            '!',
            'delete',
            'void',
            'typeof',
            'yield',
            'throw',
            'new'
        ];
        function back(n) {
            var idx = toks.length - n > 0 ? toks.length - n : 0;
            return toks[idx];
        }
        if (inExprDelim && toks.length - (start + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back(start + 2).value === ':' && parentIsBlock) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn(back(start + 2).value, unaryOps.concat(binaryOps).concat(assignOps))) {
            // ... + {...}
            return false;
        } else if (back(start + 2).value === 'return') {
            var // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            currLineNumber = typeof back(start + 1).startLineNumber !== 'undefined' ? back(start + 1).startLineNumber : back(start + 1).lineNumber;
            if (back(start + 2).lineNumber !== currLineNumber) {
                return true;
            } else {
                return false;
            }
        } else if (isIn(back(start + 2).value, [
                'void',
                'typeof',
                'in',
                'case',
                'delete'
            ])) {
            // ... in {}
            return false;
        } else {
            return true;
        }
    }
    function readToken(toks, inExprDelim, parentIsBlock) {
        var delimiters = [
            '(',
            '{',
            '['
        ];
        var parenIdents = [
            'if',
            'while',
            'for',
            'with'
        ];
        var last = toks.length - 1;
        var _comments, commentsLen = comments.length;
        function back(n) {
            var idx = toks.length - n > 0 ? toks.length - n : 0;
            return toks[idx];
        }
        function attachComments(token) {
            if (_comments) {
                token.leadingComments = comments;
            }
            return token;
        }
        function _advance() {
            return attachComments(advance());
        }
        function _scanRegExp() {
            return attachComments(scanRegExp());
        }
        var ch = t.input[t.pos];
        if (comments.length > commentsLen) {
            _comments = comments.slice(commentsLen);
        }
        if (isIn(t.input[t.pos], delimiters)) {
            return attachComments(readDelim(toks, inExprDelim, parentIsBlock));
        }
        if (ch === '/') {
            var prev = back(1);
            if (prev) {
                if (prev.value === '()') {
                    if (isIn(back(2).value, parenIdents)) {
                        // ... if (...) / ...
                        return _scanRegExp();
                    }
                    // ... (...) / ...
                    return _advance();
                }
                if (prev.value === '{}') {
                    if (blockAllowed(toks, 0, inExprDelim, parentIsBlock)) {
                        if (back(2).value === '()') {
                            if (// named function
                                back(4).value === 'function') {
                                if (!blockAllowed(toks, 3, inExprDelim, parentIsBlock)) {
                                    // new function foo (...) {...} / ...
                                    return _advance();
                                }
                                if (toks.length - 5 <= 0 && inExprDelim) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance();
                                }
                            }
                            if (// unnamed function
                                back(3).value === 'function') {
                                if (!blockAllowed(toks, 2, inExprDelim, parentIsBlock)) {
                                    // new function (...) {...} / ...
                                    return _advance();
                                }
                                if (toks.length - 4 <= 0 && inExprDelim) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp();
                    } else {
                        // ... + {...} / ...
                        return _advance();
                    }
                }
                if (prev.type === Token.Punctuator) {
                    // ... + /...
                    return _scanRegExp();
                }
                if (prev._isKeyword && prev.value !== 'this' && prev.value !== 'let' && prev.value !== 'export') {
                    // typeof /...
                    return _scanRegExp();
                }
                return _advance();
            }
            return _scanRegExp();
        }
        return _advance();
    }
    function readDelim(toks, inExprDelim, parentIsBlock) {
        var startDelim = advance(), matchDelim = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner = [];
        var delimiters = [
            '(',
            '{',
            '['
        ];
        assert(delimiters.indexOf(startDelim.value) !== -1, 'Need to begin at the delimiter');
        var token = startDelim;
        var startLineNumber = token.lineNumber;
        var startLineStart = token.lineStart;
        var startRange = token.range;
        var delimToken = {};
        delimToken.type = Token.Delimiter;
        delimToken.value = startDelim.value + matchDelim[startDelim.value];
        delimToken.startLineNumber = startLineNumber;
        delimToken.startLineStart = startLineStart;
        delimToken.startRange = startRange;
        var delimIsBlock = false;
        if (startDelim.value === '{') {
            delimIsBlock = blockAllowed(toks.concat(delimToken), 0, inExprDelim, parentIsBlock);
        }
        while (t.pos <= t.input.length) {
            token = readToken(inner, startDelim.value === '(' || startDelim.value === '[', delimIsBlock);
            if (token.type === Token.Punctuator && token.value === matchDelim[startDelim.value]) {
                if (token.leadingComments) {
                    delimToken.trailingComments = token.leadingComments;
                }
                break;
            } else if (token.type === Token.EOF) {
                throwError({}, Messages.UnexpectedEOS);
            } else {
                inner.push(token);
            }
        }
        if (// at the end of the stream but the very last char wasn't the closing delimiter
            t.pos >= t.input.length && matchDelim[startDelim.value] !== t.input[t.input.length - 1]) {
            throwError({}, Messages.UnexpectedEOS);
        }
        var endLineNumber = token.lineNumber;
        var endLineStart = token.lineStart;
        var endRange = token.range;
        delimToken.inner = inner;
        delimToken.endLineNumber = endLineNumber;
        delimToken.endLineStart = endLineStart;
        delimToken.endRange = endRange;
        return delimToken;
    }
    function read(code) {
        var tokenTree = [];
        comments = [];
        t = acorn.tokenizer(code, {
            ecmaVersion: 6,
            locations: true,
            ranges: true,
            onComment: comments
        });
        do {
            var token = readToken(tokenTree, false, false);
            tokenTree.push(token);
        } while (token.type !== Token.EOF);
        return expander.tokensToSyntax(tokenTree);
    }
    exports$2.read = read;
    exports$2.Token = Token;
}));
//# sourceMappingURL=parser.js.map