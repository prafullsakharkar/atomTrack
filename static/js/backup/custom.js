$("#selectObject").change(function(){

    var obj_name = $("#selectObject").val();
    var type_select = $("#selectType").val();
    prev_div = '#div_'+type_select+'_checkbox';
    $(prev_div).css({'display':'none'});

    reset_object()

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!")
        return null
    }

    var div_check = '';
    if (obj_name == 'Sequence'){
        $("#div_shot_task_checkbox").css({'display':'block'});
        div_check = '#div_shot_task_checkbox';
        create_table(div_check);
        load_obj_name(obj_name,'');
    }else if (obj_name == 'Asset Build'){
        $("#div_shot_task_checkbox").css({'display':'none'});
        load_types()
    }else{
        return null
    }

});

// sequence box
$('#selectSequence').on('change', function(evt, params) {

//    remove_rows("#tbl_task");
    $('#all_shots').attr('checked',false);
    var obj_name = $("#selectObject").val();
    if (!obj_name){
        alert("Please select valid Object !!")
        return null
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
        var obj_name = 'Shot';
        load_obj_name(obj_name,selectedValue);
    }else if (deselectedValue){
        de_seq = $("#selectSequence option[value='"+deselectedValue+"']").text();
        $("#selectShot option:contains('"+de_seq+"')").remove();
        $("#selectShot").trigger("chosen:updated");
        $("#selectShot").trigger("liszt:updated");
        $("#tbl_task tr:contains("+ de_seq +")").remove();
    }
});
(function () {
    var toggle_selection1=0;
    var toggle_selection2=0;
//Menu Navigator
$('a.toggle_right').click(function () {
    if(toggle_selection2==1){
        $("#panel_big").css({"width":"80%"});}
    else{
    $("#panel_big").css({"width":"88%"});}
        $("#toggle_right").css({"display":"none"});
        $("#toggle_left").css({"display":"block"});
    $("#task_menu1").css({"display":"block"});
    toggle_selection1=1;
    });
$('a.toggle_left').click(function () {
    if(toggle_selection2==1){
        $("#panel_big").css({"width":"88%"});}
    else{
        $("#panel_big").css({"width":"98%"});}
        $("#toggle_left").css({"display":"none"});
        $("#toggle_right").css({"display":"block"});
    $("#task_menu1").css({"display":"none"});
    toggle_selection1=0;
    });

// Task status navigator
$('a.toggle_task_right').click(function () {
    if(toggle_selection1==1){
        $("#panel_big").css({"width":"88%"});}
    else{
        $("#panel_big").css({"width":"98%"});}
        $("#toggle_task_right").css({"display":"none"});
        $("#toggle_task_left").css({"display":"block"});
        $("#task_menu").css({"display":"none"});
    toggle_selection2=0;
    });
$('a.toggle_task_left').click(function () {
    if(toggle_selection1==1){
        $("#panel_big").css({"width":"80%"});}
    else{
    $("#panel_big").css({"width":"88%"});}
        $("#toggle_task_left").css({"display":"none"});
        $("#toggle_task_right").css({"display":"block"});
        $("#task_menu").css({"display":"block"});
    toggle_selection2=1;
    });
    

})();
(function () {
    var previous;

    $("#selectType").focus(function () {
        previous = this.value;
    }).change(function() {
    remove_rows("#tbl_task");
    $('#all_assets').attr('checked',false);
    var obj_name = $("#selectObject").val();
    if (!obj_name){
        alert("Please select valid Object !!")
        return null
    }
   
    var select_type = $("#selectType").val();

    div_check = '#div_'+select_type+'_checkbox';
    prev_div = '#div_'+previous+'_checkbox';
    $(prev_div).css({'display':'none'});
    $(div_check).css({'display':'block'});
    create_table(div_check);

    if (select_type){
        load_obj_name(obj_name,'');
    }else{
        $("#selectAsset").empty();
        $("#selectAsset").trigger("chosen:updated");
        $("#selectAsset").trigger("liszt:updated");
        $("#div_asset_name").css({'display':'none'});
    }
    previous = this.value;
    });
})();

$('#selectShot').on('change', function(evt, params) {
    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
        var array = [];
        array[0] = selectedValue
        load_tasks(array);
    }else if (deselectedValue){
        var shot_name = $("#selectShot option[value='"+deselectedValue+"']").text();
        $("#tbl_task tr:contains("+ shot_name +")").remove();
    }
});


$("#selectAsset").on('change', function(evt, params) {

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
        var array = [];
        array[0] = selectedValue
        load_tasks(array);
    }else if (deselectedValue){
        var asset_name = $("#selectAsset option[value='"+deselectedValue+"']").text();
        $("#tbl_task tr:contains("+ asset_name +")").remove();
    }
});

function remove_rows(tablename) { 
    $(tablename).find("tr:gt(0)").remove();        
}

function reset_object(){

    $('#all_assets').attr('checked',false);
    $('#all_shots').attr('checked',false);

    $("#selectSequence").empty();
    $("#selectSequence").trigger("chosen:updated");
    $("#selectSequence").trigger("liszt:updated");
    $("#div_sequence_name").css({'display':'none'});

    $("#selectType").empty();
    $("#selectType").trigger("chosen:updated");
    $("#selectType").trigger("liszt:updated");
    $("#div_type_name").css({'display':'none'});

    $("#selectShot").empty();
    $("#selectShot").trigger("chosen:updated");
    $("#selectShot").trigger("liszt:updated");
    $("#div_shot_name").css({'display':'none'});

    $("#selectAsset").empty();
    $("#selectAsset").trigger("chosen:updated");
    $("#selectAsset").trigger("liszt:updated");
    $("#div_asset_name").css({'display':'none'});

    remove_rows('#tbl_task');
}

function load_types(){
    $select_elem = $("#selectType");
    $select_elem.empty();
    $("#div_type_name").css({'display':'block'});

    $select_elem.append('<option value="">Select Type</option>');
    $select_elem.append('<option value="Set">Set</option>');
    $select_elem.append('<option value="Prop">Prop</option>');
    $select_elem.append('<option value="Character">Character</option>');
    $select_elem.append('<option value="Vehicle">Vehicle</option>');
    $select_elem.append('<option value="Environment">Environment</option>');

    $select_elem.trigger("chosen:updated");
    $select_elem.trigger("liszt:updated");
    $select_elem.data("chosen").destroy().chosen();
}

function load_obj_name(obj_name,parent_id) {

    var project = $('#selectProject').val();
    if (!project){
        alert("Please select valid project !!")
        return null
    }

    var select_type = ''
    var $div_name = ''
    var $select_elem = ''

    if (obj_name == 'Sequence'){
        $select_elem = $("#selectSequence");
        $div_name = $("#div_sequence_name")
    }else if (obj_name == 'Asset Build'){
        $select_elem = $("#selectAsset");
        $div_name = $("#div_asset_name")
        select_type = $("#selectType").val();
    }else if (obj_name == 'Shot'){
        $select_elem = $("#selectShot");
        $div_name = $("#div_shot_name")
    }else{
        return null
    }

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'proj_id': project ,'object_name': obj_name , 'object_type' : select_type, 'parent_id' : parent_id},
        beforeSend: function(){
            if (!(parent_id)){
                $select_elem.empty(); 
            }
            $('#response').html("<img src='/static/myapp/img/loading1.gif' />");
        },
        success: function(json){
            $div_name.css({'display':'block'});
            $.each(json, function (idx, obj) {
                if(parent_id){
                    $select_elem.append('<option value="'+obj.id+'">'+obj.parent_name+'_'+obj.name+'</option>');
                }else{
                    $select_elem.append('<option value="'+obj.id+'">' + obj.name + '</option>');
                }
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
            $('#response').html("");
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function load_task(proj_id,parent_id,parent_name) {
    var mycol = [];
    var mycolusers = [];
    var task_id = [];
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'proj_id': proj_id ,'object_name': 'Task', 'parent_id': parent_id },
        beforeSend: function(){
        },
        success: function(json){
            $("#div_task_details").css({'display':'block'});
            mycol[0] = parent_name;
            $.each(json, function (idx, obj) {
                $('#tbl_task th').each(function(index) { 
                    var task_name = this.innerHTML;
                    if (obj.name == task_name){
                        task_id[index] = obj.id; 
                        mycol[index] = obj.status; 
                        mycolusers[index] = obj.users; 
                    }
                });
            });
            add_rows(mycol,parent_id,mycolusers,task_id);
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
function add_rows(mycol,parent_id,mycolusers,task_id){

    var obj_name = $("#selectObject").val();

    var table = $('#tbl_task tbody');
    row = $(table[0].insertRow(-1));
    $('#tbl_task th').each(function(index) { 
        var th_name = $(this).text();
        var t_status = '---';
        var stat_lbl = 'label-default';
        var t_stat_user = '---';
        var stat_usr_lbl = 'label-default';
        var taskid = ''
        if(mycol[index]){
            t_status = mycol[index];
            label = mycol[index].replace(/ /g,"_").toLowerCase();
            stat_lbl = 'label-'+label;
        }

        if(mycolusers[index] != ''){
            t_stat_user = mycolusers[index];
            stat_usr_lbl = 'label-default';
        }

        if(task_id[index]){
            taskid = task_id[index];
        }

        on_click_status = "";
        on_click_user = "";
        if (index > 0){
            if($(this).css('display') == 'none'){
                show = "style='display:none'";
            }else{
                show = "";
                var header = this.innerHTML;
                col_arr = $('#user_columns').val().split(',');
                if (col_arr.indexOf(header) > -1){ 
                    on_click_status = "ondblclick='editCell(this)'";
                    on_click_user = "ondblclick='editUserCell(this)'";
                }
            }

            var stat_display = ''
            var assi_display = ''
            if(show == ''){
                if($('#show_assignee').is(":not(:checked)")){
                    assi_display = 'style="display:none"';
                }
                if($('#show_status').is(":not(:checked)")){
                    stat_display = 'style="display:none"';
                }
            }

            var cell = $("<td title='"+th_name+"' data-task-id='"+taskid+"' data-org-val='"+t_status+"' data-id='show_status' "+show+" "+stat_display+" "+on_click_status+" />");
            if(t_status == '---'){
                cell = $("<td />");
            }
            col_data = '<span class="label '+stat_lbl+'" >'+t_status+'</span>';

            var usercell = $("<td title='"+th_name+"' data-task-id='"+taskid+"' data-org-val='"+t_stat_user+"' data-id='show_assignee' "+show+" "+assi_display+" "+on_click_user+" />");
            usercol_data = '<span class="label '+stat_usr_lbl+'" >'+t_stat_user+'</span>';
        }else{
            var cell = $("<td id='"+parent_id+"'/>");
            col_data = '<span class="label" >'+t_status+'</span>';

            var usercell = $("<span />");
            usercol_data = '';
        }

        
        cell.html(col_data); 
        usercell.html(usercol_data);

        th_id = $(this).attr("class");
        if ($('#' + th_id).is(":not(:checked)")){
            cell.css({'display':'none'});
        }
        row.append(cell,usercell);
    });

    $(row).click(function(event){
        if(event.ctrlKey === true) {
            $(this).toggleClass("selected")
        }
    });
}
function create_table(div_check) {

    var table = $('<table class="table-hover table-condensed table-bordered" id="tbl_task" />');

    thead = $('<thead />');
    tbody = $('<tbody />');

    var row = $(thead[0].insertRow(-1));

//    var headerCell = $('<th />');
    var headerCell = $('<th name="Name" onclick="sortOrder(this)" colspan="2"/>');
    var header = 'Name';
            
    headerCell.html(header);
    row.append(headerCell);

    col_val = $('#user_columns').val();
    col_arr = col_val.split(',');

    $(div_check+' input[type="checkbox"]').each(function() {
        if($.contains(document, this)){
            var header = this.value;
            if (col_arr.indexOf(header) > -1){
                this.checked = true;
                show = "";
            }else{
                this.checked = false;
                show = "style='display:none'";
            }

            var class_id = $(this).attr('id');
            var headerCell = $('<th name="'+header+'" class="'+class_id+'" '+show+' colspan="2"/>');
            
            headerCell.html(header);
            row.append(headerCell);
        }
    });

    table.append(thead);
    table.append(tbody);

    var dvTable = $("#div_task_details");
    dvTable.html("");
    dvTable.append(table);

    $(div_check+' input[type="checkbox"]').click(function() {
        var index = $(this).attr('id').match(/\d+/)[0];
        var index2 = index--;
        $('#tbl_task tr').each(function() { 
            if($('#show_assignee').is(":checked")){
                $('td:eq(' + index2 + ')',this).toggle();
            }
            if($('#show_status').is(":checked")){
                $('td:eq(' + index + ')',this).toggle();
            }
        });
        if($('#show_assignee').is(":checked") && $('#show_status').is(":checked")){
            $('th.' + $(this).attr('id')).attr('colspan','2');
        }else{
            $('th.' + $(this).attr('id')).attr('colspan','1');
        }
        $('th.' + $(this).attr('id')).toggle();
    });

}

$('#div_elements_checkbox input[type="checkbox"]').each(function() {
    this.checked = true;
});

$('#div_elements_checkbox input[type="checkbox"]').click(function() {
    var id = $(this).attr('id');
    var checked = this.checked;
    $('#tbl_task td').each(function() { 
        td_idx = $(this).index();
        var td_id = $(this).attr('data-id');
        var title = $(this).attr('title');
        if (td_id == id){
            if ($('#tbl_task th[name="'+title+'"]').css('display') != 'none'){
                if (checked){
                    if((id=='show_status' && $('#show_assignee').is(":checked")) || (id=='show_assignee' && $('#show_status').is(":checked"))){
                        $('#tbl_task th[name="'+title+'"]').attr('colspan','2');
                    }
                    $(this).show();
                }else{
                    $('#tbl_task th[name="'+title+'"]').attr('colspan','1');
                    $(this).hide();
                }
            }
        }
    });
});

$("#all_shots").click(function(){
    if (this.checked){
        $('#selectShot option').prop('selected', true);
    }else{
        $('#selectShot option').prop('selected', false);
    }
    $('#selectShot').trigger('chosen:updated');
    reload_tasks();

});

$("#all_assets").click(function(){
    if (this.checked){
        $('#selectAsset option').prop('selected', true);
    }else{
        $('#selectAsset option').prop('selected', false);
    }
    $('#selectAsset').trigger('chosen:updated');
    reload_tasks();
});

function reload_tasks(reload){
    
    var proj_id = $('#selectProject').val();
    var asset_ids = $('#selectAsset').val();
    var shot_ids = $('#selectShot').val();

    remove_rows("#tbl_task");
    if (asset_ids){
        load_tasks(asset_ids,reload);
    }else if(shot_ids){
        load_tasks(shot_ids,reload);
    }

}

function load_tasks(parent_ids,reload) {
    data_ids = JSON.stringify(parent_ids);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_ids': data_ids ,'object_name': 'Task', 'reload' : reload },
        beforeSend: function(){
            $('#panel_big').plainOverlay('show');
        },
        success: function(json){
            $("#div_task_details").css({'display':'block'});
            for (parent_id in json){
                var mycol = [];
                var mycolusers = [];
                var task_id = [];
                $.each(json[parent_id], function (idx, obj) {
                    mycol[0] = obj.parent_name;
                    $('#tbl_task th').each(function(index) { 
                        var task_name = this.innerHTML;
                        if (obj.name == task_name){
                            task_id[index] = obj.id; 
                            mycol[index] = obj.status; 
                            mycolusers[index] = obj.users; 
                        }
                    });
                });
            add_rows(mycol,parent_id,mycolusers,task_id);
            }
            $('#panel_big').plainOverlay('hide');
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
function editUserCell(context){

    var OriginalContent = $(context).text();
    OriginalContent = OriginalContent.split(',')[0]
    var row_stat = 'Users';
    
    var clone = $('#selectUsers').clone(true);
    clone.css({"background-color":"#444"});

    clone.val(OriginalContent).trigger("liszt:updated");
    clone.trigger("chosen:updated");
    $(context).html(clone.show("show"));

    clone.focus();
    clone.blur(function () {
        status_text = $(this).val(); 
        change_status(status_text,context,row_stat)
        change_multiple(status_text,context,row_stat);
    });

}

function editCell(context){

    var OriginalContent = $(context).text();
    var row_stat = 'Status';

    var clone = $('#selectStatus').clone(true);
    clone.css({"background-color":"#444"});

    clone.val(OriginalContent).trigger("liszt:updated");
    clone.trigger("chosen:updated");
    $(context).html(clone.show("show"));

    clone.focus();
    clone.blur(function () {
        status_text = $(this).val(); 
        change_status(status_text,context,row_stat)
        change_multiple(status_text,context,row_stat);
    });

}

function change_status(status_text,context,row_stat){

    org_val = $(context).attr('data-org-val');
    label = status_text.replace(/ /g,"_").toLowerCase();
    col_data = '<span class="label label-'+label+'">'+status_text+'</span>'
    if (row_stat == 'Users'){
        col_data = '<span class="label label-default">'+status_text+'</span>'
    }
    $(context).html(col_data);
    if (org_val == status_text){
        $(context).find('input:hidden[name=modifiedRow]').remove();
        if (!($(context).parent('tr').find('td input:hidden[name=modifiedRow]').length)){
            $(context).parent('tr').removeAttr('style');
        };
    }else{
        $(context).append('<input type="hidden" name="modifiedRow" value="'+row_stat+'" />');
        $(context).parent('tr').css({'background-color':'#52436F'});
        $("#save_changes").css({'background-color':'#52436F'});
    }

}

function change_multiple(status_text,context,row_stat){

    var idx = $(context).index();
    idx--;

    $('#tbl_task tr.selected').each(function(){
        cell = $(this).find('td:eq('+idx+')');
        change_status(status_text,cell,row_stat)
    });

}

$("#undo").click(function(){
    removeSelections();
});

function removeSelections(){

    $('#tbl_task td input:hidden[name=modifiedRow]').each(function(){
        row_stat = this.value;
        org_val = $(this).closest('td').attr('data-org-val');
        $("#save_changes").css({'background-color':'#555555'});
        $(this).parent().parent().removeAttr('style');

        label = org_val.replace(/ /g,"_").toLowerCase();
        col_data = '<span class="label label-'+label+'">'+org_val+'</span>'
        if(row_stat == 'Users'){
            col_data = '<span class="label label-default">'+org_val+'</span>'
        }
        $(this).parent().html(col_data);
    });
       $('#tbl_task tr.selected').each(function(){
                $(this).removeClass("selected");
        });
}


$("#save_changes").click(function(){

    var data_array = [];
    $('#tbl_task td input:hidden[name=modifiedRow]').each(function(){
        var row_stat = this.value;
        var valueToPush = [];
        var col=$(this).closest('td');
        var col_idx = col.index();
        var row=$(this).closest('tr');
        var row_val = col.attr('data-task-id');
        var th_name = col.attr('title');

        valueToPush[0] = col.text();
        valueToPush[1] = row_val;
        valueToPush[2] = th_name;
        valueToPush[3] = row_stat;
        data_array.push(valueToPush);
        col.attr('data-org-val',col.text());
    });
    if (data_array.length != 0){ 
        save_changes(data_array); 
        removeSelections();
    }

});
function save_changes(data_array) {
    data = JSON.stringify(data_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Save Changes', 'data_list': data},
        beforeSend: function(){
            $('#response').html("<img src='/static/myapp/img/loading1.gif' />");
        },
        success: function(json){
            $.each(json, function (idx, obj) {
            });
        
            noty({
                text: 'Your changes were saved',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        
            $('#response').html("");
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
$("#search").keyup(function(){
    _this = this;
    // Show only matching TR, hide rest of them
   if ($(this).val() === ''){
        $(this).css({"border-color": "#333"})
    }else{
        $(this).css({"border-color": "#5897fb"})
    }
    $.each($("#tbl_task tbody tr"), function(idx) {
        if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();                
        });
}); 

function demoFromHTML() {
    update()
}

function update() {
            var doc = new jsPDF();
            var elem = $('#tbl_task');
            var res = doc.autoTableHtmlToJson(elem);
            doc.autoTable(res.columns, res.data, {startY: 20});

        doc.save('table.pdf');
    }

function sortOrder(header){
    var table = $('#tbl_task');
    
    $(header)
        .wrapInner('<span title="sort this column"/>')
        .each(function(){
            
            var th = $(this),
                thIndex = th.index(),
                inverse = false;
            
            th.click(function(){
                
                table.find('td').filter(function(){
                    
                    return $(this).index() === thIndex;
                    
                }).sortElements(function(a, b){
                    
                    return $.text([a]) > $.text([b]) ?
                        inverse ? -1 : 1
                        : inverse ? 1 : -1;
                    
                }, function(){
                    
                    return this.parentNode; 
                    
                });
                
                inverse = !inverse;
                    
            });
                
        });
}

/*
$('#plain').multiprogressbar({
           parts: [
            {value: 59,barClass: "green"},
           {value: 30,barClass: "yellow"},
           {value: 11,barClass: "red"}]
    });
*/
