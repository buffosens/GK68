function updateData(){
  if(CMS.appConfig.IsUpdatedData0220)
    return;
  $.getJSON("res/data/le/lelist_" + CMS.appConfig.Language + ".json", function(data) {
    var newles = [];
    for(var i=0;i<data.length;i++){
      var isaddle = true;
      for(var j=0;j<CMS.les.length;j++){
        if(data[i].GUID == CMS.les[j].GUID){
          CMS.les[j] = JSON.parse(JSON.stringify(data[i]));
          isaddle = false;
        }
      }
      if(isaddle){
        copyLE(data[i].GUID);
        newles.push(data[i]);
      }
    }
    CMS.les = CMS.les.concat(newles);
    var modifiedLesFiles = ["11E83270-D225-45a5-96D5-AC66D1E28C12",
                            "4C0F0B8E-5CF3-47cf-BEF8-669B2EC2FEEA",
                            "5C6B3532-9E17-4805-8B7E-BABBC45382CA",
                            "7EB8A4D2-8D0B-464f-8135-A12219E72285",
                            "422389E0-DAE6-47cc-B2F1-D90D2C00E864",
                            "D5157736-C067-44cb-BA84-0B9227AFFC83",
                            "87741154-EA63-4e4c-9C59-B5249F8B8594",
                            "1E384D96-84BE-4582-B463-5ECF6DA40DC4",
                            "D43AC392-DF71-49c8-A9B2-ED2D70AD3EA1",
                            "E8BD00AA-0FB8-4640-A962-AF740C7419F3",
                            "CA48BB92-593B-4891-A52F-41E8FB04BF8B",
                            "B675057B-366F-4a63-87C9-F06EAAB8D4E5",
                            "B4323BB6-F8FE-49f2-B07A-E2569328CD3E",
                            "2A5752C0-1059-41bd-A0F1-BD476627A871",
                            "BE8F8E70-1563-4dd2-B5CB-9D9988B79F34",
                            "D388A0FB-8F42-4f7e-AFC7-F98B826C2865",
                            "F058CDB8-F108-4482-B26E-E285515E92AD",
                            "7A9A8D36-683D-4369-A277-50C2DBA0D1B0",
                            "5B255BF6-39AA-43cf-ACAD-FB87C2A03DC6",
                            "2AFA1FA8-6988-410d-AD1D-0875851E0924",
                            "8962DD8D-72FB-4fe6-80B5-DCAF5E48CCC7",
                            "0D5C872E-E4C1-4636-870C-C92B0FD951ED",
                            "3803B7F8-35F9-46cc-B96B-90660A9FA6BC",
                            "E64FDEFC-88C3-4167-8228-609F7936F253",
                            "E25817F8-DFF9-4cc5-A393-DC0EF3D4E646",
                            "8FBE33A4-675D-427e-9C94-C1A108C15A12"];
    for(var j=0;j<modifiedLesFiles.length;j++){
      copyLE(modifiedLesFiles[j]);
    }
    writeLEList(CMS.les, function(){
      CMS.appConfig.IsUpdatedData0220 = 1;
      writeAppConfig(CMS.appConfig);
      location.reload();
    });
  });
}