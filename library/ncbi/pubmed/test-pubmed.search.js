/** Unit tests specific to Pubmed search plugin **/

let assert = require('assert');
let fs = require("fs-extra");
let plugin = require('./pubmed.search');


it('claims long queries with varying strength', function () {
    let result1 = plugin.claim('BRCA1');
    let result2 = plugin.claim('breast cancer');
    assert.equal(result1, 0.9);
    assert.equal(result2, 0.5);
});

it('claims more weakly when special characters are present', function () {
    let result1 = plugin.claim('test #number');
    assert.ok(result1 < 1/2 && result1 >= 0);
    let result2 = plugin.claim('#many$bad:chars%');
    assert.ok(result2 < 0.4 && result2 >=0)
});

it('generates different urls for round 1 and round 2', function () {
    let result1 = plugin.url('Gene', 0);
    let result2 = plugin.url('Gene', 1);
    assert.ok(result2.length !== result1.length)
});

it('extracts PMIDs from round 1 response', function() {
    let r1 = fs.readFileSync(__dirname+'/response-pubmed.search-0.json').toString();
    let result = plugin.process(r1, 0);
    // round 1 should signal status not yet done <1
    assert.ok(result.status<1);
    assert.ok(result.data.includes(','));
});

it('extracts titles from round 2 response', function() {
    let r2 = fs.readFileSync(__dirname+'/response-pubmed.search-1.json').toString();
    let result = plugin.process(r2, 1);
    // round 1 should signal status is ok
    assert.equal(result.status, 1);
    assert.ok(result.data.length>1);
    assert.ok(result.data[1].includes('thesaurus'));
});

it('generates external urls based on round 1 query', function () {
    let result1 = plugin.external('Gene', 0);
    let result2 = plugin.external('Gene', 1);
    assert.ok(result2===null);
    assert.ok(result1.includes('Gene'));
});
