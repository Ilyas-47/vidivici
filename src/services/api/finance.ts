import { supabase } from '@/lib/supabase';
import type { Expense, Salary } from '@/types';

export const financeApi = {
  // Expenses
  getExpenses: async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    if (error) throw error;
    return data as Expense[];
  },
  createExpense: async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();
    if (error) throw error;
    return data as Expense;
  },
  deleteExpense: async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  },

  // Salaries
  getSalaries: async () => {
    const { data, error } = await supabase
      .from('salaries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Salary[];
  },
  createSalary: async (salary: Omit<Salary, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('salaries')
      .insert([salary])
      .select()
      .single();
    if (error) throw error;
    return data as Salary;
  },
  updateSalaryStatus: async (id: string, status: 'paid' | 'unpaid') => {
    const { data, error } = await supabase
      .from('salaries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Salary;
  },
  deleteSalary: async (id: string) => {
    const { error } = await supabase
      .from('salaries')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  }
};
