/**
 * plugin for search of the ClinGen allele registry
 */


module.exports = new function() {

    /** variables **/
    this.id = 'clingen.registry';
    this.title = 'Allele Registry';
    this.subtitle = 'Clinical Genome Resource';
    this.tags = ['human', 'genetics', 'clinical'];

    /** accompanying resources **/
    this.logo = 'clingen-logo.png';
    this.info = 'clingen-info.html';

    // urls
    var registry = 'http://reg.test.genome.network/alleles?name=';
    var genboree = 'http://reg.clinicalgenome.org/redmine/projects/registry/genboree_registry/';

    /** signal whether or not plugin can process a query **/
    this.claim = function(query) {
        query = query.trim();
        // avoid short and multi-word queries
        if (query.length<4) return 0;
        if (query.split(' ').length!=1) return 0;
        if (query.startsWith("CA")) return 1;
        if (query.startsWith("rs")) return 0.95;
        if (parseFloat(query)>0) return 0.9;
        return 0.8;
    };

    /** construct a url for an API call **/
    this.url = function(query, index) {
        return registry+query.trim();;
    };

    /** construct html summarizing genomic alleles **/
    var processGenomicAlleles = function(data) {
        var result = data.map(function(x) {
            if (x['referenceGenome'] == undefined) {
                return '';
            }
            var prefix = x['referenceGenome'] + ' ' + x['chromosome'];
            var position = x['coordinates'][0];
            var coord = position['start']
            if (position['end']!=position['start']+1) {
                coord += '-'+position['end'];
            }
            var change = position['referenceAllele'] + '&gt;' + position['allele'];
            return '<div>' + prefix + ':' + coord + ' ' + change + '</div>';
        });
        return '<p>' + result.join("") + '</p>';
    };

    /** transform a raw result from an API call into a display object **/
    this.process = function(data, index) {
        if (data.trim()=="[]") return {status: 0, data: "no results"};
        var hits = JSON.parse(data);
        var result = hits.map(function(x) {
            var caid = x["@id"].split("/").pop();
            var url = genboree + 'by_caid?caid='+caid;
            return ['<h2><b><a href="'+url+'">'+caid+'</a></b></h2>',
                processGenomicAlleles(x['genomicAlleles'])].join('');
        });
        return {status: 1, data: result};
    };

    /** construct a URL to an external information page **/
    this.external = function(query, index) {
        return genboree + 'alleles?name=' + query.trim();
    };

}();
