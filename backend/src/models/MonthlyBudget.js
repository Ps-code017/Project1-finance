const mongoose = require('mongoose');

const MonthlyBudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  monthKey: { 
    type: String,
    required: true
  },
  totalLimit: { 
    type: Number,
    default: 0
  },
  totalSpent: { 
    type: Number,
    default: 0
  }
}, { timestamps: true });


MonthlyBudgetSchema.index({ userId: 1, monthKey: 1 }, { unique: true });

MonthlyBudgetSchema.virtual('remaining').get(function() {
  return this.totalLimit - this.totalSpent;
});

MonthlyBudgetSchema.set('toJSON', { virtuals: true }); //include
MonthlyBudgetSchema.set('toObject', { virtuals: true });

export const MonthlyBudget = mongoose.model('MonthlyBudget', MonthlyBudgetSchema);
