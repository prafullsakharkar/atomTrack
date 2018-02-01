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
        $("#div_shot_task_checkbox").css({'display':'none'});
        $("#div_shot_asset_build_task_checkbox").css({'display':'none'});
        $("#div_Sequence_checkbox").css({'display':'block'});
        div_check = '#div_Sequence_checkbox';
        create_table(div_check);
        load_obj_name(obj_name,'');
    }else if (obj_name == 'Asset Build'){
        $("#div_shot_task_checkbox").css({'display':'none'});
        $("#div_Sequence_checkbox").css({'display':'none'});
        $("#div_shot_asset_build_task_checkbox").css({'display':'none'});
	$select_elem = $("#selectType");
        load_types($select_elem)
    }else if (obj_name == 'Shot'){
        $("#div_Sequence_checkbox").css({'display':'none'});
        $("#div_shot_task_checkbox").css({'display':'block'});
        $("#div_shot_asset_build_task_checkbox").css({'display':'none'});
	div_check = '#div_shot_task_checkbox';
        create_table(div_check);
        load_obj_name('Sequence','');
    }else if (obj_name == 'Shot Asset Build'){
        $("#div_shot_task_checkbox").css({'display':'none'});
        $("#div_Sequence_checkbox").css({'display':'none'});
        $("#div_shot_asset_build_task_checkbox").css({'display':'block'});
	div_check = '#div_shot_asset_build_task_checkbox';
        create_table(div_check);
        load_obj_name('Sequence','');
    }else{
        return null
    }

});

$("#selectFtpObject").change(function(){

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!")
        return null
    }

    reset_ftp_object()

    var obj_name = $("#selectFtpObject").val();
    if (obj_name == 'Shot'){
        load_obj_name('FtpSequence','');
	$("#div_shot_department_name").css({'display':'block'}); 
	$("#div_asset_department_name").css({'display':'none'}); 
	$("#selectShotFtpDepartment_chosen").css({"width":"89%"});
	$('#selectShotFtpDepartment').val('').trigger("liszt:updated").trigger("chosen:updated");
    } else if (obj_name == 'Sequence'){
        load_obj_name('FtpSequence','');
	$("#div_sequence_department_name").css({'display':'block'}); 
	$("#div_shot_department_name").css({'display':'none'}); 
	$("#div_asset_department_name").css({'display':'none'}); 
	$("#selectSequenceFtpDepartment_chosen").css({"width":"89%"});
	$('#selectSequenceFtpDepartment').val('').trigger("liszt:updated").trigger("chosen:updated");
    }else if (obj_name == 'Asset Build'){
	$select_elem = $("#selectFtpType");
        load_types($select_elem);
	$("#div_asset_department_name").css({'display':'block'}); 
	$("#div_shot_department_name").css({'display':'none'}); 
	$("#selectAssetFtpDepartment_chosen").css({"width":"89%"});
	$('#selectAssetFtpDepartment').val('').trigger("liszt:updated").trigger("chosen:updated");
    }else{
	$("#div_shot_department_name").css({'display':'none'}); 
	$("#div_asset_department_name").css({'display':'none'}); 
	$("#div_sequence_department_name").css({'display':'none'}); 
        return null
    }

});

$("#selectClientObject").change(function(){

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!")
        return null
    }

    reset_client_object()

    var obj_name = $("#selectClientObject").val();
    if (obj_name == 'Sequence'){
        load_obj_name('ClientSequence','');
    }else if (obj_name == 'Asset Build'){
	$select_elem = $("#selectClientType");
        load_types($select_elem)
    }else{
        return null
    }

});

// Asset build type
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

$("#selectFtpType").change(function(){
    select_type = $("#selectFtpType").val();
    if (!select_type){
	alert("Please select valid asset type !!!");
	return null;
    }
    load_obj_name('FtpAsset','');
});

$("#selectClientType").change(function(){
    select_type = $("#selectClientType").val();
    if (!select_type){
	alert("Please select valid asset type !!!");
	return null;
    }
    load_obj_name('ClientAsset','');
});

// Asset Build
$("#selectAsset").on('change', function(evt, params) {

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    object = $('#selectObject').val();

    if (selectedValue){
        var array = [];
        array[0] = selectedValue
	id = selectedValue
        p_name = $("#selectAsset option[value='"+id+"']").text();
        load_tasks(array,'',p_name,0,object);
    }else if (deselectedValue){
        var asset_name = $("#selectAsset option[value='"+deselectedValue+"']").text();
        $("#tbl_task tr:contains("+ asset_name +")").remove();
    }
});

$("#all_assets").click(function(){
    if (this.checked){
        $('#selectAsset option').prop('selected', true);
	$('#selectAsset').trigger('chosen:updated');
	reload_tasks();
    }else{
        $('#selectAsset option').prop('selected', false);
	$('#selectAsset').trigger('chosen:updated');
	remove_rows("#tbl_task");
    }
});

$('#selectFtpAsset').on('change', function(evt, params) {

    $('#selectFtpAssetType').val('').trigger("liszt:updated").trigger("chosen:updated");
    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
	load_ftp_asset_type(selectedValue);
    }

    if (deselectedValue){
        var asset_name = $("#selectFtpAsset option[value='"+deselectedValue+"']").text();
        $("#tbl_ftp_version tr:contains("+ asset_name +")").remove();
    }
});

$("#all_ftp_assets").click(function(){
    if (this.checked){
        $('#selectFtpAsset option').prop('selected', true);
    }else{
        $('#selectFtpAsset option').prop('selected', false);
    }
    $('#selectFtpAsset').trigger('chosen:updated');

    assets = $('#selectFtpAsset').val();
    if (assets){
	parent_id = assets[0];
	load_ftp_asset_type(parent_id);
    }else{
	alert("Please select atleast 1 asset build !!!");
	return null;
    }
});
$('#selectFtpAssetType').on('change', function(evt, params) {
    var selectedValue = params.selected;

    $('#selectFtpAssetName').val('').trigger("liszt:updated").trigger("chosen:updated");

    obj = $('#selectFtpObject').val();
    parent_id = ''
    values = ''
    if (obj == 'Shot'){
	values = $('#selectFtpShot').val();
    }else if (obj == 'Asset Build'){
	values = $('#selectFtpAsset').val();
    }

    if (values){
	parent_id = values[0];
    }else{
	alert("Please select "+obj);
	return null;
    }

    load_ftp_asset_name(parent_id);

});

$('#selectAssetFtpDepartment').change(function(){
    if ($(this).val() == 'Lighting'){
	$('#div_side_name').css({'display':'block'});
	$("#selectFtpVersionSide_chosen").css({"width":"89%"})
    }else{
	$('#div_side_name').css({'display':'none'});
    }

    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");
    refresh_asset_builds();
});

$('#refresh_asset_build').click(function(){

    refresh_asset_builds();
//    setTimeout(5000);
//    alert("Prafull");
});

$('#selectClientAsset').on('change', function(evt, params) {

    var selectedValue = params.selected;

    if (selectedValue){
	name = $('#selectClientAsset option[value="'+selectedValue+'"]').text();
	load_client_version(name);
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

    if (selectedValue && obj_name == 'Shot'){
        var obj_name = 'Shot';
        load_obj_name(obj_name,selectedValue);
    }else if (selectedValue && obj_name == 'Shot Asset Build'){
        var obj_name = 'Shot';
        load_obj_name(obj_name,selectedValue);
    }else if (selectedValue){
        var array = [];
        array[0] = selectedValue
	id = selectedValue
        p_name = $("#selectSequence option[value='"+id+"']").text();
        load_tasks(array,'',p_name,0,obj_name);
    }else if (deselectedValue){
        de_seq = $("#selectSequence option[value='"+deselectedValue+"']").text();
        $("#selectShot option:contains('"+de_seq+"')").remove();
        $("#selectShot").trigger("chosen:updated");
        $("#selectShot").trigger("liszt:updated");
        $("#tbl_task tr:contains("+ de_seq +")").remove();
    }
});

$("#all_sequences").click(function(){
    if (this.checked){
        $('#selectSequence option').prop('selected', true);
	$('#selectSequence').trigger('chosen:updated');
	reload_tasks();
    }else{
        $('#selectSequence option').prop('selected', false);
	$('#selectSequence').trigger('chosen:updated');
	remove_rows("#tbl_task");
    }

});
$('#selectFtpSequence').on('change', function(evt, params) {

    var task_name = $("#selectShotFtpDepartment").val();
    if (!task_name){
        alert("Please select valid Department !!")
        return null
    }

    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
        var obj_name = 'FtpShot';
        load_obj_name(obj_name,selectedValue);
    }else if (deselectedValue){
        de_seq = $("#selectFtpSequence option[value='"+deselectedValue+"']").text();
        $("#selectFtpShot option:contains('"+de_seq+"')").remove();
        $("#selectFtpShot").trigger("chosen:updated");
        $("#selectFtpShot").trigger("liszt:updated");
        $("#tbl_ftp_version tr:contains("+ de_seq +")").remove();
    }
});

$('#selectClientSequence').on('change', function(evt, params) {

    var seq_id = $("#selectClientSequence").val();
    if (!seq_id){
        alert("Please select valid Sequence !!")
        return null
    }

    if (seq_id){
        var obj_name = 'ClientShot';
        load_obj_name(obj_name,seq_id);
    }
});

// Shot
$('#selectShot').on('change', function(evt, params) {
    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    object = $('#selectObject').val();

    if (selectedValue){
        var array = [];
        array[0] = selectedValue
	id = selectedValue
        p_name = $("#selectShot option[value='"+id+"']").text();
        load_tasks(array,'',p_name,0,object);
    }else if (deselectedValue){
        var shot_name = $("#selectShot option[value='"+deselectedValue+"']").text();
        $("#tbl_task tr:contains("+ shot_name +")").remove();
    }
});

$("#all_shots").click(function(){
    if (this.checked){
        $('#selectShot option').prop('selected', true);
	$('#selectShot').trigger('chosen:updated');
	reload_tasks();
    }else{
        $('#selectShot option').prop('selected', false);
	$('#selectShot').trigger('chosen:updated');
	remove_rows("#tbl_task");
    }

});

$('#selectFtpShot').on('change', function(evt, params) {

    $('#selectFtpAssetType').val('').trigger("liszt:updated").trigger("chosen:updated");
    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
	load_ftp_asset_type(selectedValue);
    }

    if (deselectedValue){
        var shot_name = $("#selectFtpShot option[value='"+deselectedValue+"']").text();
        $("#tbl_ftp_version tr:contains("+ shot_name +")").remove();
    }
});

$("#all_ftp_shots").click(function(){
    if (this.checked){
        $('#selectFtpShot option').prop('selected', true);
    }else{
        $('#selectFtpShot option').prop('selected', false);
    }
    $('#selectFtpShot').trigger('chosen:updated');

    shots = $('#selectFtpShot').val();
    if (shots){
	parent_id = shots[0];
	load_ftp_asset_type(parent_id);
    }else{
	alert("Please select atleast 1 shot !!!");
	return null;
    }

});

$('#selectShotFtpDepartment').change(function(){
    if ($(this).val() == 'Lighting'){
	$('#div_side_name').css({'display':'block'});
	$("#selectFtpVersionSide_chosen").css({"width":"89%"})
    }else{
	$('#div_side_name').css({'display':'none'});
    }

    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");
    refresh_shots();
});

$('#refresh_shot').click(function(){

    refresh_shots();
//    setTimeout(5000);
//    alert("Prafull");
});

$('#selectClientShot').on('change', function(evt, params) {

    var selectedValue = params.selected;

    if (selectedValue){
	name = $('#selectClientShot option[value="'+selectedValue+'"]').text();
	load_client_version(name);
    }

});
// functions starts here
(function () {
    var toggle_selection1=0;
    var toggle_selection2=0;
//Menu Navigator
$('a.toggle_right').click(function () {
    if(toggle_selection2==1){
        $("#panel_big").css({"width":"83%"});}
    else{
    $("#panel_big").css({"width":"91%"});}
        $("#toggle_right").css({"display":"none"});
        $("#toggle_left").css({"display":"block"});
    $("#task_menu1").css({"display":"block"});
    toggle_selection1=1;
    });
$('a.toggle_left').click(function () {
    if(toggle_selection2==1){
        $("#panel_big").css({"width":"91%"});}
    else{
        $("#panel_big").css({"width":"99.50%"});}
        $("#toggle_left").css({"display":"none"});
        $("#toggle_right").css({"display":"block"});
    $("#task_menu1").css({"display":"none"});
    toggle_selection1=0;
    });

// Task status navigator
$('a.toggle_task_right').click(function () {
    if(toggle_selection1==1){
        $("#panel_big").css({"width":"91%"});}
    else{
        $("#panel_big").css({"width":"99.50%"});}
        $("#toggle_task_right").css({"display":"none"});
        $("#toggle_task_left").css({"display":"block"});
        $("#task_menu").css({"display":"none"});
    toggle_selection2=0;
    });
$('a.toggle_task_left').click(function () {
    if(toggle_selection1==1){
        $("#panel_big").css({"width":"83%"});}
    else{
    $("#panel_big").css({"width":"91%"});}
        $("#toggle_task_left").css({"display":"none"});
        $("#toggle_task_right").css({"display":"block"});
        $("#task_menu").css({"display":"block"});
    toggle_selection2=1;
    });
    

})();

function remove_rows(tablename) { 
    $(tablename).find("tr:gt(0)").remove();        
}

function reset_object(){

    $('#all_assets').attr('checked',false);
    $('#all_shots').attr('checked',false);
    $('#all_sequences').attr('checked',false);

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

function reset_ftp_object(){

    $('#all_assets').attr('checked',false);
    $('#all_shots').attr('checked',false);

    $("#selectFtpSequence").empty();
    $("#selectFtpSequence").trigger("chosen:updated");
    $("#selectFtpSequence").trigger("liszt:updated");
    $("#div_sequence_name").css({'display':'none'});

    $("#selectFtpType").empty();
    $("#selectFtpType").trigger("chosen:updated");
    $("#selectFtpType").trigger("liszt:updated");
    $("#div_type_name").css({'display':'none'});

    $("#selectFtpShot").empty();
    $("#selectFtpShot").trigger("chosen:updated");
    $("#selectFtpShot").trigger("liszt:updated");
    $("#div_shot_name").css({'display':'none'});

/*
    $("#selectFtpAsset").empty();
    $("#selectFtpAsset").trigger("chosen:updated");
    $("#selectFtpAsset").trigger("liszt:updated");
    $("#div_asset_name").css({'display':'none'});
*/

    remove_rows('#tbl_task');
}
function reset_client_object(){

    $("#selectClientSequence").empty();
    $("#selectClientSequence").trigger("chosen:updated");
    $("#selectClientSequence").trigger("liszt:updated");
    $("#div_sequence_name").css({'display':'none'});

    $("#selectClientType").empty();
    $("#selectClientType").trigger("chosen:updated");
    $("#selectClientType").trigger("liszt:updated");
    $("#div_type_name").css({'display':'none'});

    $("#selectClientShot").empty();
    $("#selectClientShot").trigger("chosen:updated");
    $("#selectClientShot").trigger("liszt:updated");
    $("#div_shot_name").css({'display':'none'});

    $("#selectClientAsset").empty();
    $("#selectClientAsset").trigger("chosen:updated");
    $("#selectClientAsset").trigger("liszt:updated");
    $("#div_asset_name").css({'display':'none'});

    $("#selectClientVersion").empty();
    $("#selectClientVersion").trigger("chosen:updated");
    $("#selectClientVersion").trigger("liszt:updated");

}
function load_types($select_elem){
    $select_elem.empty();
    $("#div_type_name").css({'display':'block'});

    $select_elem.append('<option value="">Select Type</option>');
    $select_elem.append('<option value="Set">Set</option>');
    $select_elem.append('<option value="FX">FX</option>');
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
    var client_final_combo = $("#selectFtpAssetName").val();
    var select_type = ''
    var $div_name = ''
    var $select_elem = ''
    var task_name = ''
    var status_name = ''

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
    }else if (obj_name == 'FtpSequence'){
        $select_elem = $("#selectFtpSequence");
        $div_name = $("#div_sequence_name");
	obj_name = 'Sequence';
    }else if (obj_name == 'FtpShot'){
        $select_elem = $("#selectFtpShot");
        $div_name = $("#div_shot_name");
	task_name = $("#selectShotFtpDepartment").val();
	status_name = $("#selectFtpStatus").val();
    }else if (obj_name == 'FtpAsset'){
        $select_elem = $("#selectFtpAsset");
        $div_name = $("#div_asset_build_name");
	task_name = $("#selectAssetFtpDepartment").val();
	status_name = $("#selectFtpStatus").val();
        select_type = $("#selectFtpType").val();
    }else if (obj_name == 'ClientSequence'){
        $select_elem = $("#selectClientSequence");
        $div_name = $("#div_sequence_name");
	obj_name = 'Sequence';
    }else if (obj_name == 'ClientShot'){
        $select_elem = $("#selectClientShot");
        $div_name = $("#div_shot_name");
	obj_name = 'Shot';
    }else if (obj_name == 'ClientAsset'){
        $select_elem = $("#selectClientAsset");
        $div_name = $("#div_asset_name");
        select_type = $("#selectClientType").val();
	obj_name = 'Asset Build';
    }else{
        return null
    }
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'proj_id': project ,'object_name': obj_name , 'object_type' : select_type, 'parent_id' : parent_id, 'task_name': task_name, 'status_name': status_name, 'upload_for':client_final_combo},
        beforeSend: function(){
            if (!(parent_id)){
                $select_elem.empty(); 
            }
        },
        success: function(json){
            $div_name.css({'display':'block'});
            $.each(json, function (idx, obj) {
		opt_text = ''
		opt_id = obj.id
                if(parent_id){
		    opt_text = obj.parent_name+'_'+obj.name
                }else{
		    opt_text = obj.name
                }

		$select_elem.append('<option value="'+opt_id+'">' + opt_text + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen({search_contains:true});
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
/*
function load_task(proj_id,parent_id,parent_name) {
    var mycol = [];
    var mycolusers = [];
    var task_id = [];
    var task_parent_ids = [];
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'proj_id': proj_id ,'object_name': 'Task', 'parent_id': parent_id },
        beforeSend: function(){
        },
        success: function(json){
            $("#div_task_details").css({'display':'block'});
            $.each(json, function (idx, obj) {
                $('#tbl_task th').each(function(index) { 
                    var task_name = this.innerHTML;
                    if (obj.name == task_name){
                        task_id[index] = obj.id; 
                        mycol[index] = obj.status; 
                        mycolusers[index] = obj.users; 
                        task_parent_ids[index] = obj.parent_id; 
                    }
                });
            });
            mycol[0] = parent_name;
            add_rows(mycol,parent_id,mycolusers,task_id,task_parent_ids);
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
*/
function add_rows(mycol,parent_id,mycolusers,task_id,task_parent_ids){

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
	if (task_parent_ids[index]){
	    parent_id = task_parent_ids[index];
	}
        if(mycol[index]){
            t_status = mycol[index];
            label = mycol[index].replace(/ /g,"_").toLowerCase();
            stat_lbl = 'label-'+label;
        }
	
        if(mycolusers[index]){
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

            var cell = $("<td title='"+th_name+"' data-task-id='"+taskid+"' data-org-val='"+t_status+"' data-parent-id='"+parent_id+"' data-id='show_status' "+show+" "+stat_display+" "+on_click_status+" />");
/*
            if(t_status == '---'){
                cell = $("<td title='"+th_name+"' data-task-id='"+taskid+"' data-org-val='"+t_status+"' data-id='show_status' "+show+" "+stat_display+" />");
            }
*/
            col_data = '<span class="label '+stat_lbl+'" >'+t_status+'</span>';

            var usercell = $("<td title='"+th_name+"' data-task-id='"+taskid+"' data-org-val='"+t_stat_user+"' data-parent-id='"+parent_id+"' data-id='show_assignee' "+show+" "+assi_display+" "+on_click_user+" />");
            usercol_data = '<span class="label '+stat_usr_lbl+'" >'+t_stat_user+'</span>';
        }else{

	    if (mycol[0] != t_status){
		t_status = t_status+'_'+mycol[0]; 
	    }
            var cell = $("<td id='"+parent_id+"' data-task-id='"+parent_id+"' />");
            col_data = '<a href="#" id="parent_object" onclick="show_model(this)">'+t_status+'</a>';

            var usercell = '';
            usercol_data = '';
        }

        
        cell.html(col_data); 
	if (usercell != ''){
	    usercell.html(usercol_data);
	}

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
    var headerCell = $('<th name="Name" onclick="sortOrder(this)" title="Double Click to sort"/>');
//    var headerCell = $('<th name="Name" onclick="sortOrder(this)" colspan="2" title="Double Click to sort"/>');
    var header = 'Name';
            
    headerCell.html('<i class="glyphicon glyphicon-sort-by-alphabet"></i>&nbsp;'+header);
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

        //if($('#show_status_count').is(':checked')){

            var value = $(this).attr('value');
            var truth = $('th').find(value).index();
            var truth = $('th[name^="'+value+'"]').index();//$('th:contains("'+(value)+'"$)').index();
            truth = truth + 1;
            //alert(truth + "\t ---" + value);
            var checked = this.checked;

            $("#new_table tr").each(function(){
                if($('#new_table th[name="' + value + '"]').css('display') == 'none'){
                    //alert("if style none");
                    if(checked){
                        //alert("checkbox checked");
                        $('#new_table th[name="' + value + '"]').css('display', 'table-cell');
                        $('.show_hide:nth-child('+truth+')').css('display','table-cell');
                        //$('.hide_show').css('display', 'table-cell');
                    }
                    else{
                        //alert(truth + "\t in else ---" + value);
                        $('#new_table th[name="' + value + '"]').css('display', 'none');
                        $('.show_hide:nth-child('+truth+')').css('display','none');
                    }
                    return false;
                }
                else{
                        //alert("in main else" + "\t" + truth);
                        $('#new_table th[name="' + value + '"]').css('display', 'none');
                        $('.show_hide:nth-child('+truth+')').css('display','none');
                }
                return false;
            });
        //}
    });

    create_new_table_status_count(div_check);
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

function reload_tasks(reload){
   
    reload = reload || 0;
 
    var proj_id = $('#selectProject').val();
    var asset_ids = $('#selectAsset').val();
    var shot_ids = $('#selectShot').val();
    var seq_ids = $('#selectSequence').val();
    var type_name = $('#selectType').val();
    var obj_name = $('#selectObject').val();

    remove_rows("#tbl_task");
    var parent_name  = ''
    var parent_ids = ''
    var p_name = ''
    var parent_object_type = '';
    if (asset_ids){
        pparent_ids = [proj_id]
	parent_ids = asset_ids
	id = parent_ids[0]
	p_name = $("#selectAsset option[value='"+id+"']").text();
	parent_object_name = 'Asset Build';
	parent_object_type = type_name;
    }else if(shot_ids){
        pparent_ids = seq_ids;
	parent_ids = shot_ids;
	id = parent_ids[0]
	p_name = $("#selectShot option[value='"+id+"']").text();
	parent_object_name = 'Shot';
	if (obj_name == 'Shot Asset Build'){
	    for (i in shot_ids){
		id = shot_ids[i];
		object = 'Shot Asset Build';
		p_name = $("#selectShot option[value='"+id+"']").text();
		var array = [];
		array[0] = id;
		load_tasks(array,'',p_name,0,object);
	    }
	    return null;
	}
    }else if(seq_ids){
        pparent_ids = [proj_id]
	parent_ids = seq_ids;
	id = parent_ids[0]
	p_name = $("#selectSequence option[value='"+id+"']").text();
	parent_object_name = 'Sequence';
    }
    if (parent_ids.length == 1) {
	parent_name = p_name
    }
    load_tasks(parent_ids,pparent_ids,parent_name,reload,parent_object_name,parent_object_type);

}

function load_tasks(parent_ids,pparent_ids,parent_name,reload,parent_object_name,parent_object_type) {
    var task;
    parent_name = parent_name || '';
    reload = reload || 0;
    parent_object_name = parent_object_name || '';
    parent_object_type = parent_object_type || '';

    if (parent_ids.length == 1 || reload == 1){ 
        task = 'Task';
    }else{
        task = 'Tasks';
    }

    data_ids = JSON.stringify(parent_ids);
    pparent_ids = JSON.stringify(pparent_ids);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_ids': data_ids ,'object_name': task, 'pparent_ids' : pparent_ids , 'parent_object_name': parent_object_name, 'parent_object_type': parent_object_type},
        beforeSend: function(){
            $('#panel_big').plainOverlay('show');
        },
        success: function(json){
            $("#div_task_details").css({'display':'block'});
            for (parent_id in json){
                var mycol = [];
                var mycolusers = [];
                var task_id = [];
                var task_parent_ids = [];
		var parent_type = ''
                $.each(json[parent_id], function (idx, obj) {
		    if (!mycol[0]){
			mycol[0] = obj.parent_name;
			parent_type = obj.parent_type;
		    }
                    $('#tbl_task th').each(function(index) { 
                        var task_name = this.innerHTML;
                        if (obj.name == task_name){
                            task_id[index] = obj.id; 
                            mycol[index] = obj.status; 
                            mycolusers[index] = obj.users; 
                            task_parent_ids[index] = obj.parent_id; 
                        }
                    });
                });
	    if (parent_name && parent_name != mycol[0]){
		mycol[0] = parent_name + ' <br>' + mycol[0] + ' <br><small style="color:aqua">(' + parent_type + ')<small>';
	    }
            add_rows(mycol,parent_id,mycolusers,task_id,task_parent_ids);
            }

	    show_graphs();
	    var status_hash = get_status_hash();
	    show_status_count(status_hash);
	    show_display();

            $('#panel_big').plainOverlay('hide');
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

$('#displayOptions').change(function(){
    show_display();
});

function show_display(){
    var select_val = $('#displayOptions').val();
    $('#div_task_details').css({'display':'none'});
    $('#task_status_chart').css({'display':'none'});
    $('#div_status_count_details').css({'display':'none'});
    if(select_val == "Status"){
	$('#div_task_details').css({'display':'block'});
	$('#dwn_task_status').attr("onclick","$('#tbl_task').table2excel({filename: 'task_status',exclude: '.noExl'});");
    }
    else if(select_val == "Chart"){
	$('#task_status_chart').css({'display':'block'});
    }
    else if(select_val == "Status Count"){
        $('#div_status_count_details').css({'display':'block'});
	$('#dwn_task_status').attr("onclick","$('#new_table').table2excel({filename: 'task_status_count',exclude: '.noExl'});");
    }else{
	$('#div_task_details').css({'display':'block'});
    }
}


$('#dwn_task_count_status').click(function(){

$('#status_count_table').table2excel({
    exclude: ".noExl",
    filename: "task_status_details"

});

});

/*
    this function display data
    according with status
*/
function show_status_count(status_count_hash){

    remove_rows("#new_table");

    $.each(status_count_hash, function(status_key, status_value){
	var status_row = "<td><strong>" + status_key + "</strong></td>";
	var row = $("<tr>");

	if (status_key == 'Total')
	    row = $('<tr style="background-color: black;">');

        $('#new_table th').each(function() {
            th_name = $(this).attr('name');
            th_style = $(this).attr('style');

            if(th_name != 'Status'){
                var th_name_total = status_count_hash['Total'][th_name];
                var val = status_value[th_name];
		if (val){
		    status_row = status_row + '<td style="'+th_style+' " class="show_hide" onclick="show_task_count_details(this);"><a><strong style="color: #00ff1e;">' + val + '</strong></a></td>';
		}else{
		    status_row = status_row + '<td style="'+th_style+'" class="show_hide"><strong>' + 0 + '</strong></td>';
		}
             }
        });
        row.append(status_row);
        $("#new_table").append(row);
    });// end of status_count_hash dict
//    progress_bar(status_count_hash);
}


function progress_bar(status_count_hash){

    $.each(status_count_hash, function(status_key, status_value){
		    $('#new_table th').each(function() {
		        th_name = $(this).attr('name');
		        var th_index = $(this).index();
		        var th_name_total = status_count_hash['Total'][th_name];
		        var val = status_value[th_name];

		        if(val){
		            /*$('#new_table tbody tr').find('td[status="'+status_key+'"]').find('.jqxProgressBar').jqxProgressBar(
		            {value: val, showText : true, max: th_name_total});*/

    	            //var ele = (val * th_name_total)/100;

		            $('#new_table tbody tr').find('td[status="'+status_key+'"]').find('.jqxProgressBar').progressbar({value:val, max: th_name_total});//children("span.caption").html(val);
		        }
		    });
    });
}

function create_new_table_status_count(div_check){

    var table = $('<table class="table-hover table-condensed table-bordered" id="new_table"/>');
    thead = $('<thead/>');
    tbody = $('<tbody />');

    var row = $(thead[0].insertRow(-1));

    var headerCell = $('<th style="width: 400px;" class="head_class" name="Status" title="Double Click to sort"/>');
    var header = "Status";

    headerCell.html('<i class="glyphicon glyphicon-sort-by-alphabet"></i>&nbsp;'+header);
    row.append(headerCell);

        if(div_check){
            col_val = $('#user_columns').val();
            col_arr = col_val.split(',');
        }
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
            var headerCell = $('<th name="'+header+'" '+show+'/>');
            headerCell.html(header);
            row.append(headerCell);
        }
    });
    table.append(thead);
    table.append(tbody);

    var divTable = $('#div_status_count_details');
    divTable.html('');
    divTable.append(table);


}

/*
    get the cnt of status as key
    and value as task name with total
    count
*/
function get_status_hash(){
    var status_hash = {};
    var flag = {};
    $('#tbl_task td').each(function(index){

        var td_type = $(this).attr('data-id');
        if(td_type == 'show_status'){

            var status_name = $(this).text();
            var header_name = $(this).attr('title');

	    first_col = $(this).closest('tr').find('td:first-child').text();
	    arr = first_col.split(' ');
	    if (arr.length > 1)
		first_col = arr[1];

	    if (!flag[first_col])
		flag[first_col] = {};

	    if (flag[first_col][header_name])
		return true;
	    
	    flag[first_col][header_name] = 1;

            if(!status_hash[status_name])
                status_hash[status_name] = {};

            if(!status_hash['Total'])
                status_hash['Total'] = {};

            if(!status_hash[status_name][header_name]){
                status_hash[status_name][header_name] = 1;
            }else{
                status_hash[status_name][header_name] ++;
	    }

            if(!status_hash['Total'][header_name]){
                status_hash['Total'][header_name] = 1;
            }else{
                status_hash['Total'][header_name] ++;
	    }
        }

    });

    var statuses = ['Outsource','Outsource Reject','Outsource Approved','Ready to start','In progress','Ready to Publish','Pending Internal Review','Internal Reject','Internal Approved','Client Reject','Pending Client Review','Client approved','Completed','Total'];

    var new_status_hash = {};
    for (i in statuses){
	my_status = statuses[i];
	new_status_hash[my_status] = {};
	if (status_hash.hasOwnProperty(my_status)){
	    new_status_hash[my_status] = status_hash[my_status];
	}else{
	    $('#tbl_task th').each(function(index){
		head = $(this).text();
		new_status_hash[my_status][head] = 0;
	    });
	}
    }


//    var  selectedValue = $.map( $('#selectStatus').find("option").val(), function(n){
//              return this.value;
//       });
    return new_status_hash
}

function show_graphs(){

    var task_hash = {};
    $('#tbl_task td').each(function(index) {
	var td_type = $(this).attr('data-id');
	if (td_type == 'show_status'){
	    var td_name = $(this).text();
	    var th_name = $(this).attr('title');
	    key = th_name + ':' + td_name
	    if(!task_hash[th_name]){
		task_hash[th_name] = {};
	    }
	    if(!task_hash[th_name][td_name]){
		task_hash[th_name][td_name] = 1;
	    }else{
		task_hash[th_name][td_name]++;
	    }
	}
    });
    /*
          return dict in the form of key as status
                  and values a dict with task_name => total_cnt
    */
//    alert(task_hash['Previz']['Not started']);
    $main_div = $('#task_status_chart');
    $main_div.html('')

    div = '';
    for (var key in task_hash){
	if (task_hash.hasOwnProperty(key)) {
	    task_name = key.replace(/ /g,'_');
	    div_id = task_name +'_chart'
	    div = div + '<div class="col-lg-4" style="height:415px;" id="'+div_id+'" ></div>';
	}		
    }
    $main_div.html(div);

    for (var key in task_hash){
	if (task_hash.hasOwnProperty(key)) {
	    task_name = key.replace(/ /g,'_');
	    div_id = task_name +'_chart'
	    var data = [];
	    for (var child_key in task_hash[key]){
		if (task_hash[key].hasOwnProperty(child_key)) {
		    data.push({x:task_hash[key][child_key], y:task_hash[key][child_key],name:child_key})
		}
	    }
	    chart_type = 'doughnut'
	    plot_chart(data,div_id,key,chart_type);
//	    alert(data[0]['name']);
	}		
    }
}

function plot_chart(data,div_id,title_text,chart_type){

    var chart = new CanvasJS.Chart(div_id, {
    theme: "dark2",
    exportFileName: title_text,
    exportEnabled: true,
    animationEnabled: true,
    title:{
	text: title_text
    },
    legend:{
	cursor: "pointer",
	itemclick: explodePie
    },
    data: [{
	type: chart_type,
	innerRadius: 90,
	showInLegend: true,
	toolTipContent: "<b>{name}</b>: {x} (#percent%)",
	indexLabel: "{name} - {x}",
//	indexLabel: "{name} - #percent% ",
	legendText: "{name}",
//	legendText: "{name} - ({x})",
	dataPoints: data
    }]
});
chart.render();

function explodePie (e) {
    if(typeof (e.dataSeries.dataPoints[e.dataPointIndex].exploded) === "undefined" || !e.dataSeries.dataPoints[e.dataPointIndex].exploded) {
	e.dataSeries.dataPoints[e.dataPointIndex].exploded = true;
    } else {
	e.dataSeries.dataPoints[e.dataPointIndex].exploded = false;
    }
    e.chart.render();
}

}

function editUserCell(context){

    var OriginalContent = $(context).text();
    OriginalContent = OriginalContent.split(',')
    var row_stat = 'Users';
   
    var clone = $('#users_options').clone(true);
    $clonedChosen = clone.find('select').clone().off()

    $parentTd = $(context).closest('td');
    $parentTd.empty().append($($clonedChosen).show("show"));

    $select = $parentTd.find('select')
    $select.chosen({width: "200px"})

    $select.val(OriginalContent).trigger("liszt:updated");
    $select.trigger("chosen:updated");

    $select.trigger('chosen:open');
    $select.on('chosen:hiding_dropdown', function () {
        users = $select.val();
	user_text = '---';
	if (users){
	    user_text = users.join();
	}
        change_status(user_text,context,row_stat)
        change_multiple(user_text,context,row_stat);
    });

}

function editCell(context){

    var OriginalContent = $(context).text();
    OriginalContent = OriginalContent.replace(/^\s+/ig,'');
    OriginalContent = OriginalContent.replace(/\s+$/ig,'');
    var row_stat = 'Status';

    var clone = $('#status_options').clone(true);
    $clonedChosen = clone.find('select').clone().off()

    $parentTd = $(context).closest('td');
    $parentTd.empty().append($($clonedChosen).show("show"));

    $select = $parentTd.find('select')
    $select.chosen({width: "150px"})

    $select.val(OriginalContent).trigger("liszt:updated");
    $select.trigger("chosen:updated");

    $select.trigger('chosen:open');
    $select.on('chosen:hiding_dropdown', function () {
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
	if ($(context).attr('table-type') == 'versions'){
	    $("#save_ver_changes").css({'background-color':'#52436F'});
	}else{
	    $("#save_changes").css({'background-color':'#52436F'});
	}
    }

}

function change_multiple(status_text,context,row_stat){

    var idx = $(context).index();
/*
    if ($(context).attr('table-type') != 'versions'){
	idx--;
    }
*/

    tbl_id = $(context).closest('table').attr('id');
    $('#'+tbl_id+' tr.selected').each(function(){
        cell = $(this).find('td:eq('+idx+')');
        change_status(status_text,cell,row_stat)
    });

}

$("#undo").click(function(){
    removeSelections('tbl_task');
});

$("#undo_ver").click(function(){
    removeSelections('tbl_versions');
});
function removeSelections(table){

    $('#'+table+' td input:hidden[name=modifiedRow]').each(function(){
        row_stat = this.value;
        org_val = $(this).closest('td').attr('data-org-val');
	if (table == 'tbl_task'){
	    $("#save_changes").css({'background-color':'#555555'});
	}else{
	    $("#save_ver_changes").css({'background-color':'#555555'});
	}
        $(this).parent().parent().removeAttr('style');

        label = org_val.replace(/ /g,"_").toLowerCase();
        col_data = '<span class="label label-'+label+'">'+org_val+'</span>'
        if(row_stat == 'Users'){
            col_data = '<span class="label label-default">'+org_val+'</span>'
        }
        $(this).parent().html(col_data);
    });
       $('#'+table+' tr.selected').each(function(){
                $(this).removeClass("selected");
        });
}


$("#save_changes").click(function(){

    var data_array = [];
    var proj_id = $("#selectProject").val();
    var object_type = $("#selectObject").val();

    $('#tbl_task td input:hidden[name=modifiedRow]').each(function(){
        var row_stat = this.value;
        var valueToPush = [];
        var col=$(this).closest('td');
        var col_idx = col.index();
        var row=$(this).closest('tr');
        var row_val = col.attr('data-task-id');
        var th_name = col.attr('title');
        var row_note = col.attr('data-task-note');
        var row_parent_id = col.attr('data-parent-id');
        var row_org_val = col.attr('data-org-val');

        valueToPush[0] = col.text(); // status name or username
        valueToPush[1] = row_val; // task id
        valueToPush[2] = th_name; // title attribute in <td>
        valueToPush[3] = row_stat; // Status or User
        valueToPush[4] = row_note; // note
        valueToPush[5] = row_parent_id; // parent id
        valueToPush[6] = proj_id; // parent id
        valueToPush[7] = object_type; // object_type
        valueToPush[8] = row_org_val; // original value

        data_array.push(valueToPush);
        col.attr('data-org-val',col.text());
    });
    object_name = 'Save Changes';
    if (data_array.length != 0){ 
        save_changes(data_array,object_name); 
        removeSelections('tbl_task');
    }

});
$("#save_ver_changes").click(function(){

    var data_array = [];
    var proj_id = $("#selectProject").val();
    var object_type = $("#selectObject").val();

    $('#tbl_versions td input:hidden[name=modifiedRow]').each(function(){
	var col=$(this).closest('td');

        var row_stat = col.text();
        var row_version_id = col.attr('data-version-id');
        var row_org_val = col.attr('data-org-val');

        var valueToPush = [];
        valueToPush[0] = row_stat; // status name or username
        valueToPush[1] = row_version_id; // object_type
        valueToPush[2] = row_org_val; // original value

        data_array.push(valueToPush);
        col.attr('data-org-val',col.text());
    });
    object_name = 'Save Version Changes';
    if (data_array.length != 0){ 
        save_changes(data_array,object_name); 
        removeSelections('tbl_versions');
    }

});
function save_changes(data_array,object_name) {
    var proj_id = $("#selectProject").val();
    data = JSON.stringify(data_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': object_name, 'data_list': data, 'proj_id': proj_id},
        beforeSend: function(){
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
    len = $('#tbl_task tbody tr:visible').length;
    $('#table_row_count').html(len);
}); 

$("#search_version").keyup(function(){
    _this = this;
    // Show only matching TR, hide rest of them
   if ($(this).val() === ''){
        $(this).css({"border-color": "#333"})
    }else{
        $(this).css({"border-color": "#5897fb"})
    }
    $.each($("#tbl_versions tbody tr"), function(idx) {
        if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();                
        });
}); 
$("#search_value").keyup(function(){
    _this = this;
    table = $(this).attr('table_name');
    // Show only matching TR, hide rest of them
   if ($(this).val() === ''){
        $(this).css({"border-color": "#333"})
    }else{
        $(this).css({"border-color": "#5897fb"})
    }
    $.each($("#"+table+" tbody tr"), function(idx) {
        if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();                
        });
}); 
function demoFromHTML() {
    update()
}

$('#div_dash_sequence_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#div_dash_asset_build_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#div_user_task_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#div_task_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});

function update() {
            var doc = new jsPDF();
            var elem = $('#tbl_task');
            var res = doc.autoTableHtmlToJson(elem);
            doc.autoTable(res.columns, res.data, {startY: 20});

        doc.save('table.pdf');
    }

function sortOrder(header){
    var table = $(header).closest('table');
    
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

function toggle_note(param) {
    id = $(param).find('option:selected').attr('id');
    category = $(param).val();
    category = category.replace(/ /g,"_");
    cat_id = "category-"+category+"-"+id
    all_cat_id = "category-"
    $('[id^="'+cat_id+'"]').css({'display':'block'});
    $('[id^="'+all_cat_id+'"]').each(function(index){
        this_id = $(this).attr('id')
        var patt = new RegExp(cat_id);
        var match = patt.test(this_id);
        if (!match){
            $(this).css({"display":"none"});
        }
    })
}

function editArtistCell(context){

    var OriginalContent = $(context).text();
    OriginalContent = OriginalContent.replace(/^\s+/ig,'');
    OriginalContent = OriginalContent.replace(/\s+$/ig,'');
    var row_stat = 'Status';

    var clone = $('#status_options').clone(true);
    $clonedChosen = clone.find('select').clone().off()

    $parentTd = $(context).closest('td');
    $parentTd.empty().append($($clonedChosen).show("show"));

    $select = $parentTd.find('select')
    $select.chosen({width: "150px"})

    $select.val(OriginalContent).trigger("liszt:updated");
    $select.trigger("chosen:updated");

    $select.trigger('chosen:open');

    proj_id = $parentTd.attr('data-project-id')
    if (proj_id){
	$('#selectProject').val(proj_id).trigger("liszt:updated");
	$('#selectProject').trigger("chosen:updated");
    }

    $select.on('chosen:hiding_dropdown', function () {
        status_text = $(this).val(); 
        change_status(status_text,context,row_stat)
        change_multiple(status_text,context,row_stat);
    });

}
function toggle_view(context){
    act_id = $(context).attr('id');
    id = act_id.split('-')[1]
    a_val = $(context).val();
    $('#reject_note-'+id).val('');
    $('#reject_note_accordion-'+id).fadeOut(350);
    $('#reject_notepad-'+id).fadeOut(350);
    if (a_val == 'View'){
	show_version_notes(context);
	$('#reject_note_accordion-'+id).fadeIn(350);
    }else if (a_val == 'Reject'){
	$('#reject_notepad-'+id).fadeIn(350);
    }
}
function toggle_linkview(context){
    act_id = $(context).attr('id');
    id = act_id.split('-')[1]
    a_val = $(context).val();
    $('#link_reject_note-'+id).val('');
    $('#link_reject_note_accordion-'+id).fadeOut(350);
    $('#link_reject_notepad-'+id).fadeOut(350);
    if (a_val == 'View'){
	show_linkversion_notes(context);
	$('#link_reject_note_accordion-'+id).fadeIn(350);
    }else if (a_val == 'Reject'){
	$('#link_reject_notepad-'+id).fadeIn(350);
    }
}
function show_versions(context){

    task_name = $('#selectVersionTask').val();
    asset_type = $('#selectVersionTaskAssetTypes').val();
    object_type = $('#selectObject').val();


    if (task_name == ''){
	alert("Please select task");
	return null;
    }else if (asset_type == ''){
	alert("Please select asset type");
	return null;
    }

    var object_id = $('#data-modal-object-id').val();
    
    $select_elem = $('#selectTaskVersion');
    if (object_id){
	load_versions(object_id, task_name, asset_type, object_type, $select_elem)
    }

}

function show_linkversions(context){
    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1];

    act_val = $('#selectLinkView-'+id).val();
    dept_val = $('#selectLinkDepartment-'+id).val();
    atype_val = $('#selectLinkAssetType-'+id).val();

    if (dept_val == ''){
	alert("Please select department");
	return null;
    }else if (atype_val == ''){
	alert("Please select asset type");
	return null;
    }

    build_val = $('#selectLinkDepartment-'+id).attr('data-asset-build');
    $select_elem = $('#selectLinkVersion-'+id)
    load_versions('',dept_val,atype_val,$select_elem,build_val)

}
function load_versions(object_id, task_name, asset_type, object_type, $select_elem) {
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_id': object_id ,'object_name': 'Versions', 'asset_type': asset_type , 'task_name': task_name, 'object_type': object_type},
        beforeSend: function(){
        },
        success: function(json){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select Version</option>');
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.id+'">'+obj.name+'</option>');
            });
	    $select_elem.trigger("chosen:updated");
	    $select_elem.trigger("liszt:updated");
	    $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function show_version_notes(context){
    ver_id = $('#selectTaskVersion').val();
    if (ver_id == ''){
	alert("Please select version !!");
	return null;
    }
    $('#version_note_details').html('');
    version_notes(ver_id);
    $('#btn_version_note_create').attr('data-version-id',ver_id);
}

function version_notes(task_id,obj_name,last_row,task) {
//    alert(task_id+':'+obj_name+':'+last_row+':'+task);
    $("#task_version_notes_loader").show();
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'task_id': task_id , 'type_name': obj_name, 'last_row' : last_row, 'task': task , 'object_name': 'Version Note'},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		modal_body = add_note_details(idx, obj);
		$('#version_note_details').append(modal_body);
//		add_version_notes(obj,id,idx);
            });
	$("#task_version_notes_loader").hide();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

$('#btn_version_note_create').click(function(){
    version_id = $('#selectTaskVersion').val();
    if(version_id){
	create_version_note(version_id);
    }else{
	alert("Please select version !!!");
	return null;
    }

});

function create_version_note(version_id){

    $textarea_id = $('#text_version_note');
    var note_text = $textarea_id.val().trim();
    var note_category = $('#selectVersionNoteCategory').val();

    if (!(note_text.length && version_id)){
	alert("invalid note ...");
	return null;
    }
    if (!(note_category)){
	alert("Please select valid category ...");
	return null;
    }

    attachments = [];
    $textarea_id.parent().find('table[id=gallery_versions] tr td a').each(function(){
	href = $(this).attr('href');
	attachments.push(href);
    });

    attach_files = JSON.stringify(attachments);

    note_task = '';
    note_for = 'AssetVersion';
    $div_element = $('#version_note_details');
    create_new_note(version_id, note_text, note_category, note_for, $div_element, $textarea_id, note_task, attach_files);

    $textarea_id.parent().find('table[id=gallery_versions] tbody').html('');
}

function add_version_notes(obj,id,idx){

note_author = obj.note_author;
note_head = obj.note_head;
note_replies = obj.replies;
note_category = obj.note_category;
note_date = obj.note_date;
note_id = obj.note_id;
++idx;
pid = id
id = pid+'_'+idx;

notehead = '\
    <div class="panel panel-default" id="note_category-'+id+'">\
	<div class="panel-heading">\
	    <i class="glyphicon glyphicon-envelope"></i>&nbsp;&nbsp;\
	    <span class="label2 label-'+note_category+'">'+note_category+'</span>\
	    <a data-toggle="collapse" data-parent="#reject_note_accordion-'+pid+'" href="#note_collapse-'+id+'" style="text-decoration: none;">\
	    <span class="label label-default" style="width:63%">'+note_author+' : '+note_head+'</span></a>\
	    <span class="label2 label-info">'+note_date+'</span>\
	</div>\
    </div>\
';
notebody = '\
    <div id="note_collapse-'+id+'" class="panel-collapse collapse">\
	<div class="panel-body" style="padding: 0px;">\
	    <div class="box" style="overflow:auto; height:195px; margin: 10px;">';
    replies = '';
    for (index in note_replies){
	replies = replies + '<p>'+note_replies[index]+'</p>';
    }
body2 = replies + '\
	    </div>\
';

notetail = '\
    <div id="reject_notepad-'+id+'" style="display:block">\
        <div class="box" style="margin: 10px;">\
            <table>\
                <tr>\
                    <td>\
                        <textarea cols=90 rows=2 data-note-id="'+note_id+'" id="reply_ver_note_text-'+id+'" required="" style="color:black;"></textarea>\
                    </td>\
                    <td>\
                        <button id="reply_ver_note-'+id+'" class="btn btn-inverse btn-default btn-lg" onclick="reply_ver_note(this)">Reply</button>\
                    </td>\
                </tr>\
            </table>\
        </div>\
    </div>\
';
notetailend = '\
    </div>\
</div>\
';
$('#reject_note_accordion-'+pid).append(notehead+notebody+body2+notetail+notetailend);
}

function reply_ver_note(context){

    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1];
    reply_text = $('#reply_ver_note_text-'+id).val();
    if (reply_text == ''){
	alert("Give some reply !!!");
	return null;
    }
    note_id = $('#reply_ver_note_text-'+id).attr('data-note-id');
    reply_note(reply_text,note_id);
    $('#reply_ver_note_text-'+id).val('');
    location.reload();
}

function show_linkversion_notes(context){
    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1]
    ver_id = $('#selectLinkVersion-'+id).val();
    if (ver_id == ''){
	alert("Please select version !!");
	return null;
    }
    $('#link_reject_note_accordion-'+id).html('');
    link_version_notes(ver_id,id);
}

function link_version_notes(ver_id,id) {
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Version Note', 'ver_id': ver_id},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		add_linkversion_notes(obj,id,idx);
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function add_linkversion_notes(obj,id,idx){

note_author = obj.note_author;
note_head = obj.note_head;
note_replies = obj.replies;
note_category = obj.note_category;
note_date = obj.note_date;
note_id = obj.note_id;
++idx;
pid = id
id = pid+'_'+idx;

notehead = '\
    <div class="panel panel-default" id="link_note_category-'+id+'">\
	<div class="panel-heading">\
	    <i class="glyphicon glyphicon-envelope"></i>&nbsp;&nbsp;\
	    <span class="label2 label-'+note_category+'">'+note_category+'</span>\
	    <a data-toggle="collapse" data-parent="#link_reject_note_accordion-'+pid+'" href="#link_note_collapse-'+id+'" style="text-decoration: none;">\
	    <span class="label label-default" style="width:63%">'+note_author+' : '+note_head+'</span></a>\
	    <span class="label2 label-info">'+note_date+'</span>\
	</div>\
    </div>\
';
notebody = '\
    <div id="link_note_collapse-'+id+'" class="panel-collapse collapse">\
	<div class="panel-body" style="padding: 0px;">\
	    <div class="box" style="overflow:auto; height:195px; margin: 10px;">';
    replies = '';
    for (index in note_replies){
	replies = replies + '<p>'+note_replies[index]+'</p>';
    }
body2 = replies + '\
	    </div>\
';

notetail = '\
    <div id="link_reject_notepad-'+id+'" style="display:block">\
        <div class="box" style="margin: 10px;">\
            <table>\
                <tr>\
                    <td>\
                        <textarea cols=90 rows=2 data-note-id="'+note_id+'" id="link_reply_ver_note_text-'+id+'" required="" style="color:black;"></textarea>\
                    </td>\
                    <td>\
                        <button id="link_reply_ver_note-'+id+'" class="btn btn-inverse btn-default btn-lg" onclick="link_reply_ver_note(this)">Reply</button>\
                    </td>\
                </tr>\
            </table>\
        </div>\
    </div>\
';
notetailend = '\
    </div>\
</div>\
';
$('#link_reject_note_accordion-'+pid).append(notehead+notebody+body2+notetail+notetailend);
}

function link_reply_ver_note(context){

    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1];
    reply_text = $('#link_reply_ver_note_text-'+id).val();
    if (reply_text == ''){
	alert("Give some reply !!!");
	return null;
    }
    note_id = $('#link_reply_ver_note_text-'+id).attr('data-note-id');
    reply_note(reply_text,note_id);
    $('#link_reply_ver_note_text-'+id).val('');
    location.reload();
}

function reply_note(reply_text,note_id) {
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Reply Note', 'note_id': note_id, 'reply_text': reply_text},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
            });
        
            noty({
                text: 'Reply has been given ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
function add_note(context){

    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1]
    ver_id = $('#selectVersion-'+id).val();
    note = $('#reject_note-'+id).val();
    if (ver_id == ''){
	alert("Please select version !!");
	return null;
    }
    if (note == ''){
	alert("Note is empty !!");
	return null;
    }
    var col = $('#selectVersion-'+id).closest('td');
    task_name =	col.attr('data-task-name');
    note = task_name+' : '+note;
    save_note(note,ver_id);
    $('#reject_notepad-'+id).fadeOut(350);
}

function add_linknote(context){

    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1]
    ver_id = $('#selectLinkVersion-'+id).val();
    note = $('#link_reject_note-'+id).val();
    if (ver_id == ''){
	alert("Please select version !!");
	return null;
    }
    if (note == ''){
	alert("Note is empty !!");
	return null;
    }
    var col = $('#selectLinkVersion-'+id).closest('td');
    task_name =	col.attr('data-task-name');
    note = task_name+' : '+note;
    save_note(note,ver_id);
    $('#link_reject_notepad-'+id).fadeOut(350);
}
function save_note(note,ver_id) {
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'User Note', 'note': note, 'ver_id': ver_id},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
            });
        
            noty({
                text: 'Note has been posted',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

$(function() {

    $('[data-popup-open]').on('click', function(e)  {
        var targeted_popup_class = jQuery(this).attr('data-popup-open');
        $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);
        e.preventDefault();
    });


    $('[data-popup-close]').on('click', function(e)  {
        var targeted_popup_class = jQuery(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);

        e.preventDefault();
    });
});

/*
$('#selectProject').change(function(){
    var proj_id = $("#selectProject").val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    $('#all_ftp_shots').attr('checked',false);
    var obj_name = 'FtpSequence';
    load_obj_name(obj_name,'');
});
*/


function refresh_shots(){

    var obj_name = 'FtpShot';
    seqs = $('#selectFtpSequence').val();
    selected_shots = $("#selectFtpShot").val();
    for (i in seqs){
	selectedValue = seqs[i]
	load_ftp_shots(obj_name,selectedValue,selected_shots);
    }
}

function refresh_asset_builds(){

    var obj_name = 'FtpAsset';
    selected_shots = $("#selectFtpAsset").val();
    load_ftp_shots(obj_name,'',selected_shots);
}
function load_ftp_shots(obj_name,parent_id,selected_shots) {

    var project = $('#selectProject').val();
    if (!project){
        alert("Please select valid project !!")
        return null
    }

    var client_final_combo = $("#selectFtpAssetName").val();
    var select_type = ''
    var $div_name = ''
    var $select_elem = ''
    var task_name = ''
    var status_name = ''
    var shots_exist = [];

    if (obj_name == 'FtpShot'){
	$select_elem = $("#selectFtpShot");
        $div_name = $("#div_shot_name");
        shots_exist = $("#selectFtpShot").val();
	task_name = $("#selectShotFtpDepartment").val();
	status_name = $("#selectFtpStatus").val();
    }else if (obj_name == 'FtpAsset'){
	$select_elem = $("#selectFtpAsset");
        $div_name = $("#div_asset_name");
	task_name = $("#selectAssetFtpDepartment").val();
	status_name = $("#selectFtpStatus").val();
        select_type = $("#selectFtpType").val();
    }else{
        return null
    }

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'proj_id': project ,'object_name': obj_name , 'object_type' : select_type, 'parent_id' : parent_id, 'task_name': task_name, 'status_name': status_name, 'upload_for':client_final_combo},
        beforeSend: function(){
	    $select_elem.empty();
            $div_name.css({'display':'block'});
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		opt_text = ''
		opt_id = obj.id
                if(parent_id){
		    opt_text = obj.parent_name+'_'+obj.name
                }else{
		    opt_text = obj.name
                }
		$select_elem.append('<option value="'+opt_id+'">' + opt_text + '</option>');
		if (selected_shots){
		    shot_idx = selected_shots.indexOf(opt_id)
		    if (shot_idx > -1){
			if (obj_name == 'FtpShot'){
			    $("#selectFtpShot option[value='"+selected_shots[shot_idx]+"']").prop('selected', true);
			}else if (obj_name == 'FtpAsset'){
			    $("#selectFtpAsset option[value='"+selected_shots[shot_idx]+"']").prop('selected', true);
			}
		    }
		}
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function load_ftp_asset_type(parent_id) {

    $select_elem = $('#selectFtpAssetType');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_id' : parent_id, 'object_name': 'Ftp Asset Type'},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select one ...</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.name+'">' + obj.name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function load_client_version(name) {

    var object_name = '';
    var id = $("#selectProject").val();
    var project_name = $("#selectProject option[value='"+id+"']").text()
    var component_select = $("#selectComponent").val();
    var obj_name = $("#selectClientObject").val();
    var asset_build_type = $("#selectClientType").val();
    
    if (component_select == 'Internal'){
        object_name = 'client_version';
    }
    else if (component_select == 'Client'){
        object_name = 'client_side_versions';
    }

    $select_elem = $('#selectClientVersion');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'project_name': project_name, 'parent_name' : name, 'object_name': object_name, 'task_prefer': obj_name, 'build_type': asset_build_type},
        beforeSend: function(){
	    $select_elem.empty();
//	    $select_elem.append('<option value="">Select one ...</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.version_path+'">' + obj.version_name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
function load_ftp_asset_name(parent_id) {

    asset_type = $('#selectFtpAssetType').val();
    if(!asset_type){
	alert("Please select valid asset type !!!");
	return null;
    }

    $select_elem = $('#selectFtpAssetName');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_id' : parent_id, 'object_name': 'Ftp Asset Name', 'asset_type': asset_type},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select one ...</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.name+'">' + obj.name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
function load_ftp_components(parent_id,dept) {

    asset_name = $('#selectFtpAssetName').val();
    if(!asset_name){
	alert("Please select valid asset name !!!");
	return null;
    }

    upload_for = $('#selectFtpStatus').val();
    
    $select_elem = $('#selectFtpExt');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_id' : parent_id, 'object_name': 'Ftp Component', 'asset_name': asset_name, 'department': dept, 'upload_for': upload_for},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select one ...</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.name+'">' + obj.name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

$('#selectFtpAssetName').change(function(){

    obj = $('#selectFtpObject').val();
    parent_id = ''
    values = ''
    dept = ''

    upload_notes();
    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");

    if (obj == 'Shot'){
	values = $('#selectFtpShot').val();
	dept = $('#selectShotFtpDepartment').val();
    }else if (obj == 'Asset Build'){
	values = $('#selectFtpAsset').val();
	dept = $('#selectAssetFtpDepartment').val();
    }

    if(!dept){
	alert("Please select valid department !!!");
	return null;
    }

    if (values){
	parent_id = values[0];
    }else{
	alert("Please select "+obj);
	return null;
    }
    load_ftp_components(parent_id,dept);
});
/*
$('#selectFtpAssetName').change(function(){

    $("#extended_div").css("display", "block");

    upload_notes()

    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");
    asset_name = $(this).val();
    if (!asset_name){
	alert("Please select valid asset name !!!");
	$('#div_ext_name').css({'display':'none'});
	return null;
    }
    $('#div_ext_name').css({'display':'block'})
    $select_elem = $('#selectFtpExt');
    $select_elem.empty();
    if (asset_name == 'final' && $('#selectFtpStatus').val() == 'Client') {
        $select_elem.append('<option value="exr">exr</option>');
    }else if (asset_name == 'final') {
        $select_elem.append('<option value="">Select Ext.</option>');
        $select_elem.append('<option value="exr">exr</option>');
        $select_elem.append('<option value="jpg">jpg</option>');
        $select_elem.append('<option value="mov">mov</option>');
	$('#selectFtpVersionSide').val('both').trigger("liszt:updated").trigger("chosen:updated");
    }else if (asset_name == 'sequence') {
        $select_elem.append('<option value="">Select Ext.</option>');
        $select_elem.append('<option value="mov">mov</option>');
        $select_elem.append('<option value="exr">exr</option>');
    }else if (asset_name == 'static') {
        $select_elem.append('<option value="jpg" selected>jpg</option>');
    }else if (asset_name == 'geom') {
        $select_elem.append('<option value="">Select Ext.</option>');
        $select_elem.append('<option value="review_img">review_img</option>');
        $select_elem.append('<option value="review_mov">review_mov</option>');
    }else if (asset_name == 'review') {
        $select_elem.append('<option value="mov" selected>mov</option>');
    }
    $select_elem.trigger("chosen:updated");
    $select_elem.trigger("liszt:updated");
    $select_elem.data("chosen").destroy().chosen();	

    obj = $('#selectFtpObject').val();
    if (obj == 'Sequence'){
	refresh_shots()
    }else if (obj == 'Asset Build'){
	refresh_asset_builds()
    }
});
*/
function show_upload_version(){

    $('#tbl_ftp_version tbody').empty();

    proj = $('#selectProject').val();
    stat = $('#selectFtpStatus').val();
    ass = $('#selectFtpAssetName').val();
    ext = $('#selectFtpExt').val();
    side = $('#selectFtpVersionSide').val();
    copy_opt = $('input[name="optradio"]:checked').val();
    dest_path = $('#dest_path').val();
    dest_path = dest_path.replace(/\s/g,'');
   

    if (!proj){
	alert("Please select project !!!");
	return null;
    } else if (!stat){
	alert("Please select status !!!");
	return null;
    } else if (!ass){
	alert("Please select asset name !!!");
	return null;
    } else if (!ext){
	alert("Please select Components !!!");
	return null;
    }
//    else if (!copy_opt){
//	alert("Please check copy or symlink !!!");
//	return null;
//    }
    else if (!dest_path){
	alert("Please valid destination path !!!");
	return null;
    }

    var data_array = [];
    proj_name = $("#selectProject option[value='"+proj+"']").text();
    obj = $('#selectFtpObject').val();
    
    if (obj == 'Shot'){
	dept = $('#selectShotFtpDepartment').val();
	seq = $('#selectFtpSequence').val();
	shot = $('#selectFtpShot').val();
	if (!dept){
	    alert("Please select department !!!");
	    return null;
	} else if (!seq){
	    alert("Please select Sequence !!!");
	    return null;
	} else if (!shot){
	    alert("Please select shot !!!");
	    return null;
	} else if ($("#selectShotFtpDepartment").val() == 'Lighting' && !side){
	    alert("Please select side !!!");
	    return null;
	}
	for (i in shot){
	    value = shot[i];
	    shot_name = $("#selectFtpShot option[value='"+value+"']").text();
	    str_ver = proj_name+'_'+shot_name+':'+value+'|'+stat+'|'+dept+'|'+ass+'|'+ext+'|'+side;
	    data_array.push(str_ver);
	}
    }else if (obj == 'Asset Build'){
	dept = $('#selectAssetFtpDepartment').val();
	type = $('#selectFtpType').val();
	asset = $('#selectFtpAsset').val();
	if (!dept){
	    alert("Please select department !!!");
	    return null;
	} else if (!type){
	    alert("Please select Asset Type !!!");
	    return null;
	} else if (!asset){
	    alert("Please select Asset Build !!!");
	    return null;
	}
	for (i in asset){
	    value = asset[i];
	    asset_name = $("#selectFtpAsset option[value='"+value+"']").text();
	    str_ver = proj_name+'_'+asset_name+':'+value+'|'+stat+'|'+dept+'|'+ass+'|'+ext;
	    data_array.push(str_ver);
	}
    }
    load_ftp_versions(data_array);
}


function load_ftp_versions(data_array) {

    data_array = JSON.stringify(data_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'data_array': data_array ,'object_name': 'FTP Versions' },
        beforeSend: function(){
            $('#panel_big').plainOverlay('show');
        },
        success: function(json){
                $.each(json, function (idx, obj) {
		    add_version_rows(idx, obj);
                });
            $('#panel_big').plainOverlay('hide');
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function add_version_rows(idx,obj){

    var obj_name = $("#selectObject").val();
    var table = $('#tbl_ftp_version tbody');
    row = $(table[0].insertRow(-1));
    ver = obj.version
//    updated_version = ver+
    camera_angle = obj.camera_angle
    ass = $('#selectFtpAssetName').val();
    obj_name = obj.obj_name
    upload_status = obj.status
    approved_version_number = obj.approved_version_number
    trimmed_version = obj.trimmed_version
    linked_path = obj.linked_path
    version_id = obj.version_id
    task_assignees = obj.assignees
    source_path = obj.source_path

    check_box = ''
    list_ver = ver.split(',')
    if (list_ver.length > 1){
	check_box = '<span id="cb'+idx+'"/>';
    }else if (upload_status == 'No version found'){
        check_box = '<span id="cb'+idx+'"/>';
    }else if (upload_status == 'Source folder not available'){
        check_box = '<span id="cb'+idx+'"/>';
    }else if (upload_status == 'Sequence version not yet approved by client'){
        check_box = '<span id="cb'+idx+'"/>';
    }else if (upload_status == "More than one version's status is Internal Approved"){
        check_box = '<span id="cb'+idx+'"/>';
    }
    else{
	check_box = '<input type="checkbox" id="cb'+idx+'" data-td-ver = "'+ver+':'+approved_version_number+':'+version_id+':'+source_path+'"/>';
    }
    version = ver.replace(/,/g, "</br>"); 
    if (!(upload_status == 'Ready to upload')){
        var cell = $("<td id='check_box_1'>"+check_box+"</td><td>"+obj_name+"</td><td>"+trimmed_version+"</td><td>"+approved_version_number+"<td style='color:red;'>"+upload_status+"</td><td>"+task_assignees+"</td>");
    }
    else{
        var cell = $("<td id='check_box_1'>"+check_box+"</td><td>"+obj_name+"</td><td>"+trimmed_version+"</td><td>"+approved_version_number+"<td style='color:rgb(66, 206, 82);'>"+upload_status+"</td><td>"+task_assignees+"</td>");
    }

    row.append(cell);

}

$('#upload_ftp').click(function(){
    var ftp_version = []
    side = $('#selectFtpVersionSide').val();
    upload_status = $('#selectFtpStatus').val();
    copy_opt = 'symlink'
    dest_path = $('#dest_path').val();
    dest_path = dest_path.replace(/\s/g,'');
    var listy = []
    if (dest_path.slice(0,2) == 'Z:'){
        var dest_path_1 = dest_path.split('\\');
    }
    else {
        var dest_path_1 = dest_path.split('/');

    }

    obj = $('#selectFtpObject').val();
    var dept = '';
    if (obj == 'Shot'){
	dept = $('#selectShotFtpDepartment').val();
    }else if (obj == 'Asset Build'){
	dept = $('#selectAssetFtpDepartment').val();
    }
    $('tbody tr td input[type="checkbox"]').each(function(){
	if($(this).prop('checked')){
	    ftp_version.push($(this).attr('data-td-ver'));
	}
    });
    $('tbody tr td input[type="checkbox"]').each(function(){
	if(!($(this).prop('checked'))){
	    alert("Select files after clicking on 'Show' button")
	    return null
	}
    });
    upload_files(ftp_version,side,copy_opt,dest_path_1,upload_status,dept)

});


function upload_files(data_array,side,copy_opt,dest_path,upload_status,dept) {
    var client_final_combo = $('#selectFtpAssetName').val()
    data_dest = JSON.stringify(dest_path);
    data_array = JSON.stringify(data_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'data_array': data_array ,'object_name': 'FTP Upload', 'destination':data_dest, 'prefer':copy_opt, 'side':side, 'upload_status':upload_status, 'client_final_combo': client_final_combo, 'department':dept},
        beforeSend: function(){
            $('#panel_big').plainOverlay('show');
        },
        success: function(json){
		var status_ver = '';
                $.each(json, function (idx, obj) {
		    status_ver = obj.status;
                });
            $('#panel_big').plainOverlay('hide');
                    noty({
                            text: status_ver,
                            layout: 'topCenter',
                            closeWith: ['click', 'hover'],
                            type: 'success'
			});
		setTimeout(location.reload.bind(location), 3500);
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
$('#selectFtpStatus').change(function(){
    upload_notes()
});

function upload_notes(){

    if ($('#selectFtpStatus').val() == 'Internal'){
          $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br> Task status : Pending Internal Review , Version Status : Ready to review');
    }else if ($('#selectFtpAssetName').val() == 'final' && $('#selectFtpStatus').val() == 'Client') {
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br> Task status : Client Approved , Version Status : Client Approved');
    }else if ($('#selectFtpStatus').val() == 'Review'){
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br>Task status , Version Status : Client Approved');
    }else if ($('#selectFtpStatus').val() == 'DI'){
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br>Task status , Version Status : Review Approved');
    }else {
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br>Task status , Version Status : Internal Approved');
    }
}

$('#allftpcb').change(function(){
    if($(this).prop('checked')){
        $('tbody tr td input[type="checkbox"]').each(function(){
            $(this).prop('checked', true);
        });
    }else{
        $('tbody tr td input[type="checkbox"]').each(function(){
            $(this).prop('checked', false);
        });
    }
});


function show_model(context) {

    reset_model_drop_down();

    task_id = $(context).closest('td').attr('data-task-id');
    obj_name = $('#selectObject').val();
    if (obj_name){
	if (obj_name == 'Shot Asset Build'){
	    obj_name = 'Asset Build';
	}
    }else{
	obj_name = 'Task';
    }

    task = '';
    if ($('#selectTask').val()){
	task = $('#selectTask').val();
    }

    note_task = '';
    if ($('#selectNoteTask').val()){
	note_task = $('#selectNoteTask').val();
    }

    ver_note_task = '';
    if ($('#selectVersionTask').val()){
	ver_note_task = $('#selectVersionTask').val();
    }

    last_row = 15;

    load_task_details(task_id,obj_name,last_row);

    $('#version_note_details').html('');

    $('#note_details').html('');

    // 1. Task Note Tab
    load_task_notes(task_id, obj_name, last_row, note_task);
    $('#btn_note_create').attr('data-task-id',task_id);

    // 2. Link Tab
    $('#link_details').html('');
    load_task_links(task_id,obj_name,last_row)

    // 3. Versions Tab
    remove_rows($('#tbl_versions'));

    $('#gallery_versions tbody').html('');
    $('#gallery_notes tbody').html('');

    load_asset_versions(task_id,obj_name,last_row,task);

    // 4. Version Notes Tab
    $('#note_attach').val('');
    $('#version_note_details').html('');
    version_notes(task_id,obj_name,last_row,ver_note_task);

    $('#myModal').modal('show');

    $('#note_details').on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
	    last_row += 15
	    if (note_task != $('#selectNoteTask').val()){
		note_task = $('#selectNoteTask').val();
		last_row = 15;
		$('#note_details').html('');
	    }
            load_task_notes(task_id, obj_name, last_row, note_task);
        }
    });

    $('#version_details').on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
	    last_row += 15;
	    if (task && task != $('#selectTask').val()){
		task = $('#selectTask').val();
		last_row = 15;
		remove_rows('#tbl_versions');
	    }
            load_asset_versions(task_id,obj_name,last_row,task);
        }
    });

    $('#version_note_details').on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
	    last_row += 15;
	    if (ver_note_task && ver_note_task != $('#selectVersionTask').val()){
		ver_note_task = $('#selectVersionTask').val();
		last_row = 15;
		$('#version_note_details').html('');
	    }
            version_notes(task_id,obj_name,last_row,ver_note_task);
        }
    });

    $('#selectTask').change(function(){
	task = $(this).val();
	last_row = 15;
	remove_rows('#tbl_versions');
	load_asset_versions(task_id,obj_name,last_row,task);
    });

    $('#selectNoteTask').change(function(){
	note_task = $(this).val();
	last_row = 15;
	$('#note_details').html('');
	load_task_notes(task_id, obj_name, last_row, note_task);
    });

    $('#selectVersionTask').change(function(){
	ver_note_task = $(this).val();
	last_row = 15;
	$('#version_note_details').html('');
	version_notes(task_id, obj_name, last_row, ver_note_task);
    });
}

function reset_model_drop_down(){

    $('#selectVersionTask').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectVersionTaskAssetTypes').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectTaskVersion').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectVersionNoteCategory').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectTask').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectAssetTypes').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectNoteTask').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectNoteCategory').val('').trigger("liszt:updated").trigger("chosen:updated");

    $('#note_details').html('');
    $('#version_note_details').html('');

}

function load_task_details(task_id,obj_name,last_row){
    $("#task_details_loader").show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'type_name': obj_name, 'object_name': 'Show Task Details' , 'last_row' : last_row},
	success: function(json){
	$.each(json, function (idx, obj) {
	    add_task_details(idx, obj);
	});
	$("#task_details_loader").hide();
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}

function add_task_details(idx, obj){
    html = '<input type="hidden" id="data-modal-object-id" value="'+obj.object_id+'" /><h3>'+obj.name+'</h3><label>'+obj.object_type+' ('+obj.type_name+')</label></br><small>'+obj.link_path+'</small>';

    status_label = obj.status.replace(/ /g,'_').toLowerCase();
    priority_label = obj.priority.replace(/ /g,'_');

    status_span = '<span class="label label-'+status_label+'">'+obj.status+'</span>'
    priority_span = '<span class="label label-'+priority_label+'">'+obj.priority+'</span>'

    table = ' \
<div class="col-md-12">\
    <div class="col-md-4">'+html+'</div>\
    <div class="col-md-4"><br>\
        <table>\
            <tr><td><label>Status</label></td><td>'+status_span+'</td></tr>\
            <tr><td><label>Priority</label></td><td>'+priority_span+'</td></tr>\
        </table>\
    </div>\
</div>\
';
    $('#modal_header').html(table);
}

function load_task_notes(task_id, obj_name, last_row, note_task){
    $("#task_notes_loader").show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'type_name': obj_name, 'object_name': 'Show Note Details' , 'last_row' : last_row, 'note_task': note_task},
	success: function(json){
	$.each(json, function (idx, obj) {
	    modal_body = add_note_details(idx, obj);
	    $('#note_details').append(modal_body);
	});
	$("#task_notes_loader").hide();
	toggle_asset_type($('#selectAssetTypes'));
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}

$('#btn_note_create').click(function(){
    task_id = $(this).attr('data-task-id');
    if(task_id){
	create_a_note(task_id);
    }

});


function create_a_note(task_id){

    $textarea_id = $('#text_artist_note');
    var note_text = $textarea_id.val().trim();
    var note_category = $('#selectNoteCategory').val();
    if (!(note_text.length && task_id)){
	alert("invalid note ...");
	return null;
    }
    if (!(note_category)){
	alert("Please select valid category ...");
	return null;
    }

    obj_name = $('#selectObject').val();
    if (obj_name){
        if (obj_name == 'Shot Asset Build'){
            obj_name = 'Asset Build';
        }
    }else{
        obj_name = 'Task';
    }

    attachments = [];
    $textarea_id.parent().find('table[id=gallery_notes] tr td a').each(function(){
	href = $(this).attr('href');
	attachments.push(href);
    });

    attach_files = JSON.stringify(attachments);
    note_task = $('#selectNoteTask').val();
    
    note_for = obj_name;
    $div_element = $('#note_details');
    create_new_note(task_id, note_text, note_category, note_for, $div_element, $textarea_id, note_task, attach_files);

    $textarea_id.parent().find('table[id=gallery_notes] tbody').html('');

}

function create_new_note(task_id, note_text, note_category, note_for, $div_element, $textarea_id, note_task, attach_files){

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Create Note', 'task_id': task_id, 'note_text': note_text, 'note_category': note_category, 'note_for': note_for, 'note_task': note_task, "attach_files": attach_files},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
            });
        
            noty({
                text: 'Note added successfully ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
    $textarea_id.val('');
    note_author = $div_element.attr('data-user-id').toLowerCase();
    note_date = new Date().toLocaleFormat('%F %T');
    note_head = note_text;
    note_category = note_category.replace(' ','_');
    my_note = '\
	<div class="box row" id="category-'+note_category+'"> \
	    <span class="label label-info">'+note_author+'</span>\
	    <span class="label label-'+note_category+'" style="width\:62%">'+note_category+'</span> \
	    <span class="label label-info" style="float\:right;">'+note_date+'</span>\
	    <p>'+note_head+'</p>\
	</div>\
    ';
    $div_element.append(my_note);

}

function reply_to_note(my_note_id){

    $textarea_id = $('#text_artist_note-'+my_note_id);
    var reply_text = $textarea_id.val().trim();
    if (!(reply_text.length && my_note_id)){
	alert("invalid note ...");
	return null;
    }

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Reply Note', 'note_id': my_note_id, 'reply_text': reply_text},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
            });
        
            noty({
                text: 'Reply done ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
    $textarea_id.val('');
    user = $('#note_details').attr('data-user-id').toLowerCase();
    current_date = new Date().toLocaleFormat('%F %T');
    my_reply = '<p>'+user+' :- '+reply_text+'<span class="label" style="float:right;">'+current_date+'</span></p>';
    $('#note_replies-'+my_note_id).append(my_reply);

}
function popup_video(param){
	$('#myModal').modal('hide');
        $(param).popVideo({
            playOnOpen: true,
            title: "",
          closeOnEnd: false,
            pauseOnClose: true,
        }).open()
}


function popup_image(param){

$(param).ekkoLightbox();

}

function add_note_details(idx, obj){
    note_author = obj.note_author;
    note_id = obj.note_id;
    note_category = obj.note_category;
    note_date = obj.note_date;
    note_head = obj.note_head;
    note_head = note_head.replace(/\n/g,'</br>');
    task_name = obj.task_name;
    
    note_info = obj.note_info;
    
    if (obj.note_components.length > 0){
	component = '';
	for (k in obj.note_components){
	    my_url = obj.note_components[k].url;
	    file_type = obj.note_components[k].file_type;
	    if (file_type == '.mov'){
		component = component + '&nbsp; <video src="'+my_url+'" webkit-playsinline playsinline data-video="'+my_url+'" loop muted autoplay id="note_video" class="video" height="80" onclick="popup_video(this)">\
</video> ';
	    }else{
		component = component + '&nbsp; <a href="'+my_url+'"> <img src="'+my_url+'" height="80" width="auto"> </a>';
	    }
	}
	note_head = note_head + '<br>' + component;
    }

    reply = '';
    if (obj.replies.length > 0){
	reply = '';
	for (j in obj.replies){
	    my_reply = obj.replies[j];
	    r_array = my_reply.split('||');
	    reply = reply + '<p>'+r_array[0]+'<span class="label" style="float:right;">'+r_array[1]+'</span></p>';
	}
    }

    do_reply = '\
                                            <table> \
                                                <tr> \
                                                    <td style="width: 100%;"> \
                                                        <textarea id="text_artist_note-'+note_id+'" rows="4" cols="20" placeholder="Write a comment..." class="x-form-field x-form-text x-form-textarea" autocomplete="off" style="width: 100%; height: 48px;"></textarea> \
                                                    </td> \
                                                    <td> \
                                        <button class="btn btn-inverse btn-default btn-lg" id="btn_note_reply" onclick="reply_to_note(\''+note_id+'\')" style="width: 60px;"> \
                        <i class="glyphicon glyphicon-send icon-white"></i></button> \
                                                    </td> \
                                                </tr> \
                                            </table> \
';

    if (note_category != 'Internal'){
	do_reply = '';
    }
    if (reply){
	reply = '\
	    <div class="box row" id="note_replies-'+note_id+'"> \
	    '+reply+'\
	    </div> \
	';
    }

    style = 'style="width:81%"';
    if (task_name){
	style = 'style="width:61%"';
    }
    modal_body = '\
	<div class="box row" id="category-'+note_category+'"> \
	    <span class="label label-info" >'+task_name+'</span>\
	    <span class="label label-'+note_category+'" '+style+'>'+note_category+'</span> \
	    <span class="label label-info" style="float\:right;">'+note_date+'</span>\
	    <p>'+note_head+'</p>\
	    <div class="box row"><strong>'+note_info+'</strong><button class="btn btn-xs btn-primary" style="float\:right;">'+ note_author +'</button></div>\
	    '+reply+'\
	    '+do_reply+'\
	</div>\
    ';

    return modal_body;
}


function load_task_links(task_id,obj_name,last_row){
    $("#task_link_loader").show();
    body_row_array = []
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'type_name': obj_name, 'object_name': 'Show Link Details' , 'last_row' : last_row},
	success: function(json){
	$.each(json, function (idx, obj) {
	    body_row = add_link_details(idx, obj);
	    body_row_array.push(body_row);
	});
	$("#task_link_loader").hide();
	$('#link_details').html('<div class="panel-group" id="link_accordion">'+body_row_array.join('')+'</div>');
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}

function add_link_details(idx, obj){
    link = '<span class="label label-None" style="width:100%">'+obj.name+'</label>';
    body_row = '\
	<div class="panel panel-default" id="link_category-'+idx+'">\
            <div class="panel-heading">\
                <a data-toggle="collapse" data-parent="#link_accordion" href="#link_collapse1-'+idx+'" style="text-decoration: none;">'+link+'</a>\
            </div>\
	    <div id="link_collapse1-'+idx+'" class="panel-collapse collapse">\
	    </div>\
	</div>\
    ';
    return body_row;
}

function load_asset_versions(task_id,obj_name,last_row,task){
    $("#version_loader").show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'type_name': obj_name, 'object_name': 'Show Asset Versions' , 'last_row' : last_row, 'task': task},
	success: function(json){
	    $.each(json, function (idx, obj) {
		add_version_details(idx, obj);
	   });
	    $("#version_loader").hide();
	    toggle_asset_type($('#selectAssetTypes'));
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}

function add_version_details(idx, obj){

    var table = $('#tbl_versions tbody');
    add_version_row(table,obj)   
}

function add_version_row(table,obj){

    label_status = obj.status_name.replace(/ /g,"_").toLowerCase();
    asset_type = obj.asset_type.replace(/ /g,"_").toLowerCase();
    row = $(table[0].insertRow(-1));
    row.attr('id','asset_type-'+asset_type)

    enable_dblclick = ''
    if (obj.user_role == 'Supervisor' || obj.user_role == 'Co-ordinator'){
	enable_dblclick = 'ondblclick="editCell(this)"'
    }

    row_data = '\
	  <td>'+obj.version_name+'</td> \
	  <td class="center">'+obj.asset_type+'</td> \
	  <td table-type="versions" data-org-val="'+obj.status_name+'" data-version-id="'+obj.version_id+'" data-id="show_status" '+enable_dblclick+'>\
	    <span class="label label-'+label_status+'">'+obj.status_name+'</span></td>\
	  <td class="center" style="width: 207px;">'+obj.published_on+'</td> \
	  <td class="center">'+obj.published_by+'</td> \
	'
    row.append(row_data);
    $(row).click(function(event){
        if(event.ctrlKey === true) {
            $(this).toggleClass("selected")
        }
    });
}

function toggle_parent_note(param) {
//    id = $(param).find('option:selected').attr('id');
    category = $(param).val();
    category = category.replace(/ /g,"_");
//    cat_id = "category-"+category+"-"+id
    cat_id = "category-"+category
    all_cat_id = "category-"
    $('[id="'+cat_id+'"]').css({'display':'block'});
    $('[id^="'+all_cat_id+'"]').each(function(index){
        this_id = $(this).attr('id')
//        var patt = new RegExp(cat_id);
//        var match = patt.test(this_id);
        if(cat_id == all_cat_id){
            $(this).css({"display":"block"});
        }else if (this_id != cat_id){
            $(this).css({"display":"none"});
	}

    })
}

function toggle_asset_type(param) {
    _this = param
    $.each($("#tbl_versions tbody tr"), function(idx) {
        if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();
        });
}

$('#download_user_task').click(function(){
    $("#tbl_task").table2excel({
	exclude: ".noExl",
	name: "UserReports",
	filename: "user_task_details.xls"
    });
});

$('#download_task_status').click(function(){
    $("#tbl_task").table2excel({
	exclude: ".noExl",
	name: "TaskReports",
	filename: "task_reports.xls"
    });
});

function insert_db_note(note_text, note_category, object_id, change_status, users, task_path, version){

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "DB Note", "note_text": note_text, "note_category": note_category, "task_id": object_id, "users": users, "task_path": task_path, "change_status": change_status, "version":version},
	success: function(json){
	},
	error: function(error){
	    console.log("Error:"+error);
	}
    });

}
function add_task_note(note, note_category, object_id, note_for, attach_files){

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "Create Note", "note_text": note, "note_category": note_category, "task_id": object_id, "note_for": note_for, "attach_files": attach_files},
	success: function(json){
	    noty({
                text: 'Note added successfully ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
	},
	error: function(error){
	    console.log("Error:"+error);
	}
    });

}

function object_status_change(new_status, old_status, object_id, status_for){

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "Change Status", "new_status": new_status, "old_status": old_status, "object_id": object_id, "status_for": status_for},
	success: function(json){
	    noty({
                text: 'Status has been changed ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
	},
	error: function(error){
	    console.log("Error:"+error);
	}
    });

}

function attach_media_files(param){
    $("#fileupload").click();

$("#fileupload").fileupload({
    dataType: 'json',
    sequentialUploads: true,
    url: '/callajax/',

    start: function (e) {
      $(".progress").css({"display":"block"});
    },

    stop: function (e) {
      $(".progress-bar").css({"width": "0%"});
      $(".progress-bar").text("0%");
      $(".progress").css({"display":"none"});
    },

    progressall: function (e, data) {
      var progress = parseInt(data.loaded / data.total * 100, 10);
      var strProgress = progress + "%";
      $(".progress-bar").css({"width": strProgress});
      $(".progress-bar").text(strProgress);
    },

    done: function (e, data) {
      if (data.result.is_valid) {
	my_gallery = $(param).attr('data-gallery');
	if (!my_gallery){
	    my_gallery = 'gallery';
	}
        $("#"+my_gallery+" tbody").append(
          "<tr><td style='text-align:left'><a href='" + data.result.url + "'>" + data.result.name + "</a></td><td style='width: 10%;'><button type='button' class='btn btn-inverse btn-default btn-xs' onclick='$(this).parent().parent().remove()'><span class='glyphicon glyphicon-remove'></span></button></td></tr>");
      }
    }

  });
}

function approve_task(param){
    $tr = $(param).closest('tr');
    $td_status = $tr.find('td[data-td=status]');
    my_status = $td_status.attr('data-org-val');

    $td_date = $tr.find('td[data-td=modified_date]');

    change_status = '';
    change_status_label = '';
    if (my_status == 'Pending Client Review'){
	change_status = 'Client Approved';
	change_status_label = 'client_approved';
    }else if (my_status == 'Pending Internal Review'){
	change_status = 'Ready to Publish';
        change_status_label = 'ready_to_publish';
    }
    object_id = $tr.attr('data-task-id');
    version_id = $tr.attr('data-version-id');
    object_type = $tr.attr('data-object-type');

    if (object_id){
    // changing status here
	object_status_change(change_status, my_status ,object_id, 'Task');

	if (version_id){
	    object_status_change(change_status, my_status ,version_id, 'AssetVersion');
	}

	$td_status.html('<span class="label label-'+change_status_label+'">'+change_status+'</span>');
	$td_status.attr('data-org-val',change_status);

	my_date = new Date().toLocaleFormat('%F %T');
	$td_date.html('<strong>'+my_date+'</strong>');
    
	$(param).css({'display':'none'});
	$(param).parent().find('[id=task_reject]').css({'display':'none'});
    }
}

function reject_task(param){
    $tr = $(param).closest('tr');
    $td_status = $tr.find('td[data-td=status]');
    my_status = $td_status.attr('data-org-val');

    $td_date = $tr.find('td[data-td=modified_date]');

    $td_users = $tr.find('td[data-td=users]');
    var users = $td_users.text().trim();

    $td_task_path = $tr.find('td[data-td=task_path]');
    var task_path = $td_task_path.text().trim();

    $td_version = $tr.find('td[data-td=version]');
    var version = $td_version.text();

    object_id = $tr.attr('data-task-id');
    version_id = $tr.attr('data-version-id');
    object_type = $tr.attr('data-object-type');

    change_status = '';
    change_status_label = '';
    note_category = '';

    if (my_status == 'Pending Client Review'){
	change_status = 'Client Reject';
	change_status_label = 'client_reject';
	note_category = 'Client feedback';
    }else if (my_status == 'Pending Internal Review'){
	change_status = 'Internal Reject';
	change_status_label = 'internal_reject';
	note_category = 'Internal';
    }

    $('#task_reject_note').val('');
    var $newModal = $("#myModal").clone();
    $newModal.modal('show');

    $newModal.on('click', '#btn_note_reject', function(e){
	e.preventDefault();

	var note_text = $(this).parent().find('textarea[id=task_reject_note]').val().trim();
	if (!(note_text.length && object_id)){
	    alert("invalid note ...");
	    return null;
	}

	var attachments = [];
	$(this).parent().find('table[id=gallery] tr td a').each(function(){
	    href = $(this).attr('href');
	    attachments.push(href);
	});

	attach_files = JSON.stringify(attachments);
	
	object_status_change(change_status, my_status , object_id, 'Task');

	if (version_id){
	    object_status_change(change_status, my_status , version_id, 'AssetVersion');
	    add_task_note(note_text, note_category, version_id, 'AssetVersion', attach_files);
	}else{
	    add_task_note(note_text, note_category, object_id, 'Task', attach_files);
	}

	insert_db_note(note_text, note_category, object_id, change_status, users, task_path, version);

	$td_status.html('<span class="label label-'+change_status_label+'">'+change_status+'</span>');
	$td_status.attr('data-org-val',change_status);

	my_date = new Date().toLocaleFormat('%F %T');
	$td_date.html('<strong>'+my_date+'</strong>');
    
	$(param).css({'display':'none'});
	$(param).parent().find('[id=task_approved]').css({'display':'none'});

	$newModal.modal('hide');
    });

}

$('#selectMGMDashProject').change(function(){
    mgm_dashboard();

});

function mgm_dashboard(){

    project_id = $('#selectMGMDashProject').val();
    if(!project_id){
	alert("Please select valid project !!!");
    }

    project = $("#selectMGMDashProject option[value='"+project_id+"']").text(); 

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'MGM Dashboard', 'project': project},
	beforeSend: function(){
	    remove_rows('#tbl_sequence');
	    remove_rows('#tbl_asset_build');
	    $('#div_dash_users_count').html('');
        },
	success: function(json){
	    $.each(json,function(idx,obj){

		var users_data = obj.user_count;
		show_total_users(users_data);
	
		var sequence_data = obj.sequence;
		create_sequence_table(sequence_data);
		
		var asset_build_data = obj.asset_build;
		create_asset_build_table(asset_build_data);
	    });	    
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

function show_total_users(data) {
        var user = '';
        var total = '';
        var task = '';
        $.each(data, function(key, value){

	    var count = Object.keys(value).length;
            if(key == 'total_users'){
                total = "<div class='box col-at-1' "+
                            "style='display:block;text-align:center;'>"+
                          "<div class='controls'>"+"<label class='label_style'>"+
                          key+" &nbsp;</label><br/>"+"<div class='count_task' style='font-size:20px;color:darkorange'>"+
                          count + "</div></div></div>";
            }
            else{
                task = task + "<div class='box col-at-1' "+
                            "style='display:block;text-align:center;'>"+
                          "<div class='controls'>"+"<label class='label_style'>"+
                          key+" &nbsp;</label><br/>"+"<div class='count_task' style='font-size:20px;color:#00fff6'>"+
                          count + "</div></div></div>";
            }
        });
        $('#div_dash_users_count').append(total+task);
}


function create_sequence_table(data){

    $.each(data, function(seq,task_status){
	wip_data = '<td rowspan="3"><h3>'+seq+'</h3></td><td rowspan="3"><h5>'+task_status.total_shots+'</h5></td><td>WIP</td>';
	done_data = '<td>DONE</td>';
	approved_data = '<td>APPROVED</td>';
	$.each($("#tbl_sequence th"), function(idx) {
	    if (idx <= 2)
		return;

	    head = $(this).text();
	    if (task_status.WIP[head] == 0){ 
		wip_data = wip_data + '<td>'+task_status.WIP[head]+'</td>';
	    }else{
		wip_data = wip_data + '<td><strong style="color: #00ff1e;">'+task_status.WIP[head]+'</strong></td>';
	    }
	    if (task_status.DONE[head] == 0){ 
		done_data = done_data + '<td>'+task_status.DONE[head]+'</td>';
	    }else{
		done_data = done_data + '<td><strong style="color: #00ff1e;">'+task_status.DONE[head]+'</strong></td>';
	    }
	    if (task_status.APPROVED[head] == 0){ 
		approved_data = approved_data + '<td>'+task_status.APPROVED[head]+'</td>';
	    }else{
		approved_data = approved_data + '<td><strong style="color: #00ff1e;">'+task_status.APPROVED[head]+'</strong></td>';
	    }
	});
	tr_wip = '<tr>'+wip_data+'</tr>';
	tr_done = '<tr>'+done_data+'</tr>';
	tr_approved = '<tr>'+approved_data+'</tr>';
	$("#tbl_sequence").append(tr_wip+tr_done+tr_approved)
    
    });
}
function create_asset_build_table(data){

    $.each(data, function(asset_type,task_status){
	wip_data = '<td rowspan="3"><h3>'+asset_type+'</h3></td><td rowspan="3"><h5>'+task_status.total_assets+'</h5></td><td>WIP</td>';
	done_data = '<td>DONE</td>';
	approved_data = '<td>APPROVED</td>';
	$.each($("#tbl_asset_build th"), function(idx) {
	    if (idx <= 2)
		return;

	    head = $(this).text();
	    if (task_status.WIP[head] == 0){ 
		wip_data = wip_data + '<td>'+task_status.WIP[head]+'</td>';
	    }else{
		wip_data = wip_data + '<td><strong style="color: #00ff1e;">'+task_status.WIP[head]+'</strong></td>';
	    }
	    if (task_status.DONE[head] == 0){ 
		done_data = done_data + '<td>'+task_status.DONE[head]+'</td>';
	    }else{
		done_data = done_data + '<td><strong style="color: #00ff1e;">'+task_status.DONE[head]+'</strong></td>';
	    }
	    if (task_status.APPROVED[head] == 0){ 
		approved_data = approved_data + '<td>'+task_status.APPROVED[head]+'</td>';
	    }else{
		approved_data = approved_data + '<td><strong style="color: #00ff1e;">'+task_status.APPROVED[head]+'</strong></td>';
	    }
	});
	tr_wip = '<tr>'+wip_data+'</tr>';
	tr_done = '<tr>'+done_data+'</tr>';
	tr_approved = '<tr>'+approved_data+'</tr>';
	$("#tbl_asset_build").append(tr_wip+tr_done+tr_approved)
    
    });
}

$('#show_records').click(function(){
    user_dashboard();

});

function user_dashboard(){

    project_id = $('#selectDashProject').val();
    if(!project_id){
	alert("Please select valid project !!!");
    }

    project = $("#selectDashProject option[value='"+project_id+"']").text(); 
    duration = $('#reportrange span').html();
    if(!duration){
	alert("Please select valid duration !!!");
    }

    task = $('#selectTask').val();

    dur_arr = duration.split(' : ');

    first = dur_arr[0];
    last = dur_arr[1];

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'User Dashboard', 'project': project, 'duration': duration, 'first': first, 'last': last, 'task': task},
	beforeSend: function(){
	    remove_rows('#tbl_task');
	    $("#div_task_details .dashboard-list").remove();
	    $("#div_status_count .dashboard-list").remove();
	    $("#div_task_count .dashboard-list").remove();
            $('#panel_big').plainOverlay('show');
        },
	success: function(json){
	    $.each(json,function(idx,obj){

		var task_data = obj.task_list;
		user_task_table(task_data);
		
		var top_data = obj.top_task_users;
		top_artist(top_data);
	
		var task_count_data = obj.task_count_data;
		task_count(task_count_data);

		var task_chart_type = 'pie';
		var data = obj.tash_graph_data;
		var div_id = 'chart_task_details';
		var title_text = 'Task';
		plot_chart(data,div_id,title_text,task_chart_type);

		var status_chart_type = 'doughnut';
		var status_data = obj.status_graph_data;
		var status_div_id = 'chart_status_details';
		var status_title_text = 'Status';
		plot_chart(status_data,status_div_id,status_title_text,status_chart_type);
		status_count(status_data);
	    });	    
            $('#panel_big').plainOverlay('hide');
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

function user_task_table(data){

    $.each(data, function(idx,obj){
	row = '<tr>\
	<td title="Task"><strong>'+obj.task_name+'</strong></td>\
	<td><strong>'+obj.task+'</strong></td>\
	<td title="User"><strong>'+obj.user+'</strong></td>\
	<td title="Status"><strong>'+obj.ftrack_status+'</strong></td>\
	<td><strong>'+obj.start_min_date+'</strong></td>\
	<td><strong>'+obj.stop_max_date+'</strong></td>\
	<td title="Time" data-seconds="'+obj.total_seconds+'" data-task="'+obj.task_name+'"><strong>'+obj.total_hours+'</strong></td>\
	</tr>';
	$("#tbl_task").append(row);
    });
}


function top_artist(data){

    $.each(data, function(idx,obj){
	
	row = '<ul class="dashboard-list">\
	    <li onclick="highlight_this(this,\''+obj.user_id+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
                <a href="#"><img class="dashboard-avatar" alt="" src="http://192.168.1.18/Employees/'+obj.empcode+'.jpg" onclick="search_value(\''+obj.user_id+'\',\'search\',\'tbl_task\',\'table_row_count\')"></a>\
		    <strong>Name:</strong>&nbsp; <a href="#">'+obj.user+'</a><br>\
                <strong>Total Time:</strong>&nbsp; <span>'+obj.time+'<span/><br>\
                <strong>Department:</strong>&nbsp; <span>'+obj.departments+'</span><br>\
                <strong>Tasks:</strong>&nbsp; <span>'+obj.tasks+'</span>\
            </li>\
	</ul>';
        $("#div_task_details").append(row);
    });
}

function highlight_this(context,user_id,search,tbl_task,table_row_count){

    div_id = $(context).parent().parent().attr('id');
    $('#'+div_id+' ul').each(function(){
	$(this).find('li').removeAttr('style');
    });

    $(context).css({"background-color": "#2e3338"});
    search_value(user_id,search,tbl_task,table_row_count);
}
/*
function status_count(data){

    $("#div_status_count").html('');
    $.each(data, function(idx,obj){
	row = '<ul class="dashboard-list">\
	    <li>\
		<a href="#" onclick="search_value(\''+obj.name+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
                    <span>'+obj.x+'&nbsp;-</span>\
                    <strong>'+obj.name+'</strong>\
                </a>\
            </li>\
        </ul>';
        $("#div_status_count").append(row);
    });
}
*/
function status_count(data){

    remove_rows('#tbl_status_count');
    $.each(data, function(idx,obj){
	row = '<tr onclick="search_value(\''+obj.name+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
	    <td><strong style="color: #0fff00;">' +obj.x+ '</strong></td> <td><strong>' +obj.name+ '</strong></td>\
        </tr>';
        $("#tbl_status_count").append(row);
    });
}
/*
function task_count(data){

    $("#div_task_count").html('');
    $.each(data, function(idx,obj){
	row = '<ul class="dashboard-list">\
	    <li>\
		<a href="#" onclick="search_value(\''+obj.name+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
                    <span>'+obj.count+'&nbsp;-</span>\
                    <strong>'+obj.name+'</strong>\
                </a>\
            </li>\
        </ul>';
        $("#div_task_count").append(row);
    });
}
*/
function task_count(data){

    remove_rows('#tbl_task_count');
    $.each(data, function(idx,obj){
	row = '<tr onclick="search_value(\''+obj.name+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
	    <td><strong style="color: #0fff00;">' +obj.count+ '</strong></td> <td><strong>' +obj.name+ '</strong></td> <td><strong>' +obj.hours+ '</strong></td>\
        </tr>';
        $("#tbl_task_count").append(row);
    });
}

$('#selectDuration').change(function(){
    duration  = $('#selectDuration').val();

    if(duration == "Daily"){

        var todayTimeStamp = +new Date; // Unix timestamp in milliseconds
        var oneDayTimeStamp = 1000 * 60 * 60 * 24; // Milliseconds in a day
        var diff = todayTimeStamp - oneDayTimeStamp;
        var yesterdayDate = new Date(diff);
        var start_date = yesterdayDate.getFullYear() + '-' + (yesterdayDate.getMonth() + 1) + '-' + yesterdayDate.getDate();
        end_date = start_date

        $('#from_date').val(start_date);
        $('#to_date').val(end_date);

        $('#from_date').prop('disabled', true);
        $('#to_date').prop('disabled', true);
    }
    if(duration == "Weekly"){
        date_now = new Date();
        first_day_of_week = (date_now.getDate() - date_now.getDay()) + 1;
        last_day_of_week = first_day_of_week + 6;

        //first day of previous week
        first_day_of_last_week = new Date(date_now.setDate(first_day_of_week - 7));

        start_date = first_day_of_last_week.getFullYear()+"-"+(first_day_of_last_week.getMonth()+1)+"-"+first_day_of_last_week.getDate();
        // last day of previous week
        last_day_of_last_week = new Date(date_now.setDate(last_day_of_week - 7));

        end_date = last_day_of_last_week.getFullYear()+"-"+(last_day_of_last_week.getMonth()+1)+"-"+last_day_of_last_week.getDate();

        $('#from_date').val(start_date);
        $('#to_date').val(end_date);

        $('#from_date').prop('disabled', true);
        $('#to_date').prop('disabled', true);
    }

    if(duration == "Monthly"){
        var date = new Date();

        var start_date = date.getFullYear() + "-" + (date.getMonth()) + "-" + 1;

        var last_date = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

        var end_date = date.getFullYear() + "-" + (date.getMonth()) + "-" + last_date;

        $('#from_date').val(start_date);
        $('#to_date').val(end_date);

        $('#from_date').prop('disabled', true);
        $('#to_date').prop('disabled', true);
    }

    if(duration == "Date Wise"){

        $('#from_date').prop('disabled', false);
        $('#to_date').prop('disabled', false);

        $("#from_date").datepicker(
        {
            format:'yyyy-mm-dd'
        });
        $("#to_date").datepicker(
        {
            format:'yyyy-mm-dd'
        });


    }
});

$('#clear_search').click(function(){
    search_value('', 'search', 'tbl_task', 'table_row_count');
    $('#div_task_details ul').each(function(){
        $(this).find('li').removeAttr('style');
    });

});

function search_value(value, search_box, table, table_row_count){

    $search = $('#'+search_box);

    $search.val(value)
    // Show only matching TR, hide rest of them
   if ($search.val() === ''){
        $search.css({"border-color": "#333"})
    }else{
        $search.css({"border-color": "#5897fb"})
    }
    $.each($("#"+table+" tbody tr"), function(idx) {
	
        if($(this).text().toLowerCase().indexOf($search.val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();
        });
    len = $('#'+table+' tbody tr:visible').length;
    $('#'+table_row_count).html(len);

    show_dashboard_graphs();
}

function show_dashboard_graphs(){

    var task_hash = {};
    $('#tbl_task tr:visible td').each(function(index) {
	var th_name = $(this).attr('title');
	if (th_name == 'Time'){
	    var td_name = $(this).attr('data-task');
	    var seconds = $(this).attr('data-seconds');
	    key = th_name + ':' + td_name
	    if(!task_hash[th_name]){
		task_hash[th_name] = {};
	    }
	    if(!task_hash[th_name][td_name]){
		task_hash[th_name][td_name] = parseInt(seconds);
	    }else{
		task_hash[th_name][td_name] = task_hash[th_name][td_name] + parseInt(seconds);
	    }
	}
	if (th_name == 'Status'){
	    var td_name = $(this).text();
	    key = th_name + ':' + td_name
	    if(!task_hash[th_name]){
		task_hash[th_name] = {};
	    }
	    if(!task_hash[th_name][td_name]){
		task_hash[th_name][td_name] = 1;
	    }else{
		task_hash[th_name][td_name]++;
	    }
	}
	if (th_name == 'Task'){
	    var td_name = $(this).text();
	    key = th_name + ':' + td_name
	    if(!task_hash[th_name]){
		task_hash[th_name] = {};
	    }
	    if(!task_hash[th_name][td_name]){
		task_hash[th_name][td_name] = 1;
	    }else{
		task_hash[th_name][td_name]++;
	    }
	}
    });
//    alert(task_hash['Task']['Previz']+':'+task_hash['Time']['Previz']);

    var status_data = [];
    var time_data = [];
    var task_data = [];
    for (var key in task_hash){
	if (task_hash.hasOwnProperty(key)) {
	    if (key == 'Status'){
		for (var child_key in task_hash[key]){
		    if (task_hash[key].hasOwnProperty(child_key)) {
			status_data.push({x:task_hash[key][child_key], y:task_hash[key][child_key],name:child_key});
		    }
		}
	    }

	    if (key == 'Time'){
		for (var child_key in task_hash[key]){
		    if (task_hash[key].hasOwnProperty(child_key)) {
			time_x = secondsTimeSpanToHMS(task_hash[key][child_key]);
			time_data.push({x:time_x, y:task_hash[key][child_key],name:child_key});
		    }
		}
	    }

	    if (key == 'Task'){
		for (var child_key in task_hash[key]){
		    if (task_hash[key].hasOwnProperty(child_key)) {
			task = child_key;
			time_sec = task_hash['Time'][task];
			time_hrs = secondsTimeSpanToHMS(time_sec);
			task_data.push({hours:time_hrs, count:task_hash[key][child_key],name:child_key});
		    }
		}
	    }
	}
    }

    task_count(task_data);

    var status_chart_type = 'doughnut';
    var status_div_id = 'chart_status_details';
    var status_title_text = 'Status';
    plot_chart(status_data,status_div_id,status_title_text,status_chart_type);
    status_count(status_data);

    var task_chart_type = 'pie';
    var div_id = 'chart_task_details';
    var title_text = 'Task';
    plot_chart(time_data,div_id,title_text,task_chart_type);

}

/*
    function to show task count details
    on click event on status count table
*/

function show_task_count_details(context){

    remove_rows('#status_count_table');

        // getting the row index of particular clicked td;
        var tbody_td_index = $(context).parent().index();

        // stores the th name of the clicked td
        var index_var = $(context).index();

        var new_th_name = $('#new_table th').eq(index_var).text();

        // stores the current clicked td status  from the status column.
        var status = $(context).closest('td').siblings(':first-child').text();

        // get the table header name from tbl_task table
        var task = $('#tbl_task th').eq(index_var).text();

        // get the selected project name from project dropdown
        var project_name = $('#selectProject option:selected').text();

        //$('#project_id').val(project_name);
        $("label[data-id='project']").text(project_name);

        var obj_value = $('#selectObject option:selected').text();

        $("label[data-id='objects']").text(obj_value);
        //$('#object_id').val(obj_value);
        if(obj_value == 'Asset Build')
            var type_name = $('#selectType option:selected').text();
        else
            var type_name = $('#selectSequence option:selected').text();

        //$('#asset_sequ_id').val(type_name);

        $("label[data-id='sequences']").text(type_name);

        var asset_name = '';

        var task_name = '';

        var i = (index_var * 2) - 1;

	var flag = {};
        $('#tbl_task tbody tr').each(function(){

            //different assets from the table
            asset_name = $(this).children("td:first-child").text();

	    // below code for shot asset build
	    arr = asset_name.split(' ');
            if (arr.length > 2)
                asset_name = arr[1];

            if (flag[asset_name])
                return true;
	    
	    flag[asset_name] = 1;

            // task name in proper format
            task_name = project_name + ":" + asset_name + ":" + task;

            // getting the selected column colspan
            s = $('#tbl_task tr th').eq(index_var).prop('colspan');//.text();

            var j = 0;

            //if( s > 1){

                //status of the selected task
                var prev_status = $('td', this).eq(i).text();
                if(status == prev_status){
                  //user assigned to selected task
                  var assigned_user = $('td', this).eq(i + 1).text();
                  var row = $("<tr>");
                  row.append("<td>" + task +"</td>");
                  row.append("<td>" + task_name +"</td>");
                  row.append("<td>" + assigned_user +"</td>");
                  row.append("<td>" + prev_status +"</td>");
                  $("#status_count_table").append(row);
                }else if(status == 'Total'){
                  var assigned_user = $('td', this).eq(i + 1).text();
                  var row = $("<tr>");
                  row.append("<td>" + task +"</td>");
                  row.append("<td>" + task_name +"</td>");
                  row.append("<td>" + assigned_user +"</td>");
                  row.append("<td>" + prev_status +"</td>");
                  $("#status_count_table").append(row);
		}
            //}

        });
        //return false;
        $('#mytaskcount').modal('show');
}

$('#selectArtistProject').change(function(){
    show_artist_tasks();
});
$('#selectStatus').change(function(){
    show_artist_tasks();
});
$('#task_refresh').click(function(){
    show_artist_tasks();
});

function show_artist_tasks(){

    project_id = $('#selectArtistProject').val();
    if(!project_id){
	    alert("Please select valid project !!!");
    }

    project = $("#selectArtistProject option[value='"+project_id+"']").text();
    selected_status = $('#selectStatus').val();

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Artist Tasks', 'project': project, 'status': selected_status},
	beforeSend: function(){
	    remove_rows('#tbl_task');
        },
	success: function(json){
	    $.each(json,function(idx,obj){
	        color_code = 'style="color:#a7ff0c"';
	        if (obj.time_left.startsWith('-')){
	            color_code = 'style="color:#ff2a0c"'
	        }
	        table_row = '\
            <tr>\
                  <td>\
                    <strong>'+obj.project+'</strong>\
                  </td>\
                  <td>\
                    <strong>'+obj.task+'</strong>\
                  </td>\
                  <td style="width:400px;" data-task-id="'+obj.task_id+'">\
                    <strong><a href="#" id="task_object"\
                               onclick="show_model(this)">[ '+obj.path+' ]</a></strong>\
                  </td>\
                  <td data-task-id="'+obj.task_id+'"\
                      data-org-val="'+obj.ftrack_status+'"\
                      data-project-id="'+obj.project_id+'">\
                    <span class="label label-'+obj.status_label+'">'+obj.ftrack_status+'</span>\
                  </td>\
                  <td>\
                    <strong>'+obj.start_date+'</strong>\
                  </td>\
                  <td>\
                    <strong>'+obj.finish_date+'</strong>\
                  </td>\
                  <td>\
                    <span class="label label-'+obj.backup_status+'">'+obj.backup_status+'</span>\
                  </td>\
                  <td>\
                    <strong>'+obj.upload_date+'</strong>\
                  </td>\
                  <td>\
                    <strong>'+obj.bid_hours+'</strong>\
                  </td>\
                  <td>\
                    <strong>'+obj.total_hours+'</strong>\
                  </td>\
                  <td>\
                    <strong '+color_code+'>'+obj.time_left+'</strong>\
                  </td>\
                </tr>';
            $('#tbl_task tbody').append(table_row);
	    });
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}
$('#selectReviewProject').change(function(){
    show_review_tasks();
});

function show_review_tasks(){

    project = $('#selectReviewProject').val();
    if(!project){
	    alert("Please select valid project !!!");
    }

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Review Tasks', 'project': project},
	beforeSend: function(){
	    remove_rows('#tbl_task');
        },
	success: function(json){
	    $.each(json,function(idx,obj){
	        table_row = '\
	    <tr data-task-id="'+obj.task_id+'" data-version-id="'+obj.version_id+'" data-object-type="'+obj.object_type+'">\
                  <td><strong>'+obj.project+'</strong></td>\
                  <td><strong>'+obj.task+'</strong></td>\
                  <td style="width:300px;" data-task-id="'+obj.task_id+'" data-td="task_path"><strong>'+obj.path+'</strong></td>\
                  <td data-td="version"><strong>'+obj.version+'</strong></td>\
                  <td data-td="users"><strong>'+obj.users+'</strong></td>\
                  <td title="'+obj.task+'" data-task-id="'+obj.task_id+'" data-org-val="'+obj.ftrack_status+'" data-td="status">\
                    <span class="label label-'+obj.status_label+'">'+obj.ftrack_status+'</span>\
                  </td>\
                  <td data-td="modified_date"><strong>'+obj.updated_on+'</strong></td>\
                  <td>\
                    <button class="btn btn-inverse btn-success btn-sm" id="task_approved" style="color: black;" onclick="approve_task(this)">\
                      <i class="glyphicon glyphicon-thumbs-up"></i>&nbsp;&nbsp;Approve </button>\
                    <button class="btn btn-inverse btn-danger btn-sm" id="task_reject" style="color: black;" onclick="reject_task(this)">\
                      <i class="glyphicon glyphicon-thumbs-down"></i>&nbsp;&nbsp;Reject </button>\
                  </td>\
                </tr>';
            $('#tbl_task tbody').append(table_row);
	    });
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}
/*
function get_entity_data(entity_id,entity_type){

    if(!entity_id || !entity_type){
	alert("Not Valid !!!");
	return null;
    }

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Entity Details', 'entity_id': entity_id, 'entity_type': entity_type},
	beforeSend: function(){
	    $('#div_entity_details').html('');
        },
	success: function(json){
	    entity_data = '\
		<div class="box col-md-3" style="text-align: center;font-size: 20px;height: 180px;">\
                <br><br>\
                <button class="btn btn-primary btn-lg">Create '+ entity_type +' +</button>\
              </div>\
	    ';
	    $.each(json,function(idx,obj){
		entity_data = entity_data + '\
		    <div class="box col-md-3" style="text-align: center;font-size: 20px;height: 180px;">\
                <br>\
                <div class="col-md-6">Name</div>\
                <div class="col-md-6">{{ proj|upper }}</div>\
                <br><br>\
                <div class="col-md-6">\
                  <button class="btn btn-primary btn-sm" onclick="get_entity_data("'++'", "'++'")">Asset Build</button>\
                </div>\
                <div class="col-md-6">\
                  <button class="btn btn-primary btn-sm" onclick="get_entity_data('{{ id }}', 'Sequence')">Sequence</button>\
                </div>\
              </div>\
		';

	    });
            $('#div_entity_details').append(entity_data);
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}
*/

function secondsTimeSpanToHMS(s) {
    var h = Math.floor(s/3600); //Get whole hours
    s -= h*3600;
    var m = Math.floor(s/60); //Get remaining minutes
    s -= m*60;
    return h+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds
}

// Reload page here
window.onload = function() {
    if ($('#dashboard_page').attr('class') == 'active'){
        user_dashboard();
    }
    if ($('#mgm_dashboard_page').attr('class') == 'active'){
        mgm_dashboard();
    }
    if ($('#artist_tasks').attr('class') == 'active'){
        show_artist_tasks();
    }
}
