import { MonthlyBudget } from "../models/MonthlyBudget.js";

//updateBudgetOnTransaction updates a user's monthly budget document when a debit transaction is created/updated/deleted. It ensures the category exists, increments/decrements totalSpent, and updates the appropriate category spent values — attempting to keep things consistent even when the transaction’s category changes.

export const updateBudgetonTransaction=async(transaction,deltaAmount,oldCategory=null)=>{
    //transaction --> transaction document
    // deltaAmount --> net change (new amount - old amount ) (-/+ of transaction.amount)
    // oldCategory --> category prior update (null in case of new transaction)

    if(deltaAmount==0 || transaction.type!=='debit'){
        return;
    }
    const monthKey=transaction.monthKey
    const userId=transaction.userId
    const newCategory=transaction.category

    await MonthlyBudget.updateOne({userId,monthKey},
        {
            $addToSet:{categoryBudgets:{category:newCategory,limit:0,spent:0}}
        },{upsert:true}
    );

    const primaryUpdates={
        $inc:{
            totalSpent:deltaAmount,
            'categoryBudget.$[elem].spent':deltaAmount
        }
    }
    let arrayFilter=[{'elem.category':newCategory}]

    //if category of transaction change 
    // in this we only swap the category deduction in the new category handled by primary update
    if(oldCategory && oldCategory!=newCategory){
        const transactionAmount=Math.abs(transaction.amount);
        await MonthlyBudget.findOneAndUpdate({userId,monthKey,'categoryBudgets.category':oldCategory},
            {
                $inc:{'categoryBudgets.$[old].spent':-transactionAmount}
            },{arrayFilters:[{'old.category':oldCategory}]}
        )
    }

    await MonthlyBudget.findOneAndUpdate({userId,monthKey},
        primaryUpdates,
        {new:true,arrayFilters:arrayFilter}
    )
}


//what is does is take the change in amount and oldCategory(if category is changed ) or oldcategory==null if it is a new transaction
// now as transaction occur vo ek particular type ki hogi 
// so after transaction occur we increase the totalSpent and jis type ki transaction h sirf usi type ki spent change hogi
//this is the main work of primary handle
// and of category changes purani category ki spent ko htana pdega this done in the if(old.category )
//now sab kuch ho gya now just primary update ko run karna on that budget 