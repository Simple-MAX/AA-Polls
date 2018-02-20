$(document).ready(function(){
    let table = $('poll-picker');
    let table_tools = new $.fn.detaTable.TableTools(table, {
        'sSwfPath':'//cdn.datatables.net/tabletools/2.2.4/swf/copy_csv_xls_pdf.swf',
        'aButtons':[
            {
                'sExtends':'csv', 
                'sFileName': table
            },
            {
                'sExtends':'pdf', 
                'sFileName': table
            }
        ]
        });
    $(table_tools.fnContainer()).insertBefore('#poll-picker_wrapper');

});