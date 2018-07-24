using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using PX.Data;
using PX.Common;
using PX.Objects.AR.BQL;
using PX.Objects.CM;
using PX.Objects.GL;
using PX.Objects.CS;
using PX.Objects.PM;
using PX.Objects.TX;
using PX.Objects.CA;
using PX.Objects.DR;
using PX.Objects.CR;
using PX.Objects.SO;
using PX.Objects.AR.CCPaymentProcessing;
using PX.Objects.AR.Overrides.ARDocumentRelease;
using PX.Objects.Common;
using PX.Objects.Common.DataIntegrity;
using PX.Objects.Common.Exceptions;
using Avalara.AvaTax.Adapter;
using Avalara.AvaTax.Adapter.TaxService;
using PX.Objects.AR.CCPaymentProcessing.Helpers;
using SOOrder = PX.Objects.SO.SOOrder;
using SOInvoice = PX.Objects.SO.SOInvoice;
using SOOrderShipment = PX.Objects.SO.SOOrderShipment;
using INTran = PX.Objects.IN.INTran;
using PMTran = PX.Objects.PM.PMTran;
using CRLocation = PX.Objects.CR.Standalone.Location;
using PX.Objects;
using PX.Objects.AR;
using PX.Objects.CT;


namespace PX.Objects.AR
{
  public class ARReleaseProcess_Extension : PXGraphExtension<ARReleaseProcess>
  {
  
   public bool SetupContract = false;


  
    public delegate void PersistDelegate();
    [PXOverride]
    public void Persist(PersistDelegate baseMethod)
    {
      ARRegister invoice = Base.ARDocument.Current;
      List<Contract> setupContracts = new List<Contract>();
      if (SetupContract)
      {
       // Create, set up, and activate contracts
         ContractMaint contractMaint = PXGraph.CreateInstance<ContractMaint>();
         CTBillEngine engine = PXGraph.CreateInstance<CTBillEngine>();
         int seq = 1;
       // Reuse ARTran_TranType_RefNbr from ARReleaseProcess
       foreach (ARTran tran in
 
      PXSelect<ARTran,
      Where<ARTran.tranType, Equal<Required<ARInvoice.docType>>,
      And<ARTran.refNbr, Equal<Required<ARInvoice.refNbr>>,
      And<ARTranExt.usrSIMCardID, IsNotNull,
      And<ARTranExt.usrContractID, IsNull>>>>,
      OrderBy<Asc<ARTran.tranType, Asc<ARTran.refNbr,
      Asc<ARTran.lineNbr>>>>>
     .Select(Base, invoice.DocType, invoice.RefNbr))
      {
      // Create, set up, and activate contract for a particular SOInvoice line
     ARTranExt tranExt = PXCache<ARTran>.GetExtension<ARTranExt>(tran);
     Contract contract = CreateActivateContract(contractMaint,
     invoice.DocDate, invoice.CustomerID, invoice.CustomerLocationID,
     tranExt.UsrSIMCardID, tranExt.UsrPhoneNumber, engine);
      setupContracts.Add(contract);
      // Associate the generated contract with the SOInvoice line
     tranExt.UsrContractID = contract.ContractID;
    
     Base.ARTran_TranType_RefNbr.Cache.SetValueExt(tran , "UsrContractID",contract.ContractID);
     Base.ARTran_TranType_RefNbr.Cache.SetStatus(tran , PXEntryStatus.Modified);
     Base.ARTran_TranType_RefNbr.Cache.Update(tran);
     Base.ARTran_TranType_RefNbr.Cache.IsDirty = true;  
     seq++;
     }
   }
 baseMethod();
 }


      
      private Contract CreateActivateContract(ContractMaint contractMaint,
         DateTime? invoiceDate, int? customerID, int? customerLocationID,
          string simCardID, string phoneNumber, CTBillEngine engine)
        {
         contractMaint.Clear();
        // Initialize new contract
         Contract contract =
         (Contract)contractMaint.Contracts.Cache.CreateInstance();
         contract = contractMaint.Contracts.Insert(contract);
         // Look up contract template ID
          Contract template = PXSelect<Contract,
          Where<Contract.isTemplate, Equal<boolTrue>,
          And<Contract.contractCD, Equal<Required<Contract.contractCD>>>>>
          .Select(Base, "SIMCARD");
          if (template == null)
          throw new
          PXException("The SIMCARD contract template was not found.");
          // Set required fields
          contract.TemplateID = template.ContractID;
          contract.CustomerID = customerID;
          contract = contractMaint.Contracts.Update(contract);
          contract.LocationID = customerLocationID;
          contract.StartDate = invoiceDate;
          contract.ActivationDate = invoiceDate;
          contract = contractMaint.Contracts.Update(contract);
          // Store simCardID and phoneNumber into the contract attributes
         foreach (CSAnswers attribute in contractMaint.Answers.Select())
          {
            switch (attribute.AttributeID)
            {
 
             case "SIMCARDID":
             attribute.Value = simCardID;
             contractMaint.Answers.Update(attribute);
             break;
             case "PHONENUM":
             attribute.Value = phoneNumber;
             contractMaint.Answers.Update(attribute);
             break;
             }
        }
      // Save the generated contract
      contractMaint.Save.Press();
      // Set up and activate the contract
       engine.SetupAndActivate(contract.ContractID, contract.ActivationDate);
      return contract;
   }
      
  }
}