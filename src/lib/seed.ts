import { supabase } from './supabase';

export async function seedDatabase() {
  try {
    // Create admin user
    const { error: adminError } = await supabase
      .from('users')
      .upsert([
        {
          employee_code: 'Drmas1191411',
          name: 'System Administrator',
          role: 'Admin',
        }
      ], { onConflict: 'employee_code' });

    if (adminError) {
      console.error('Error creating admin user:', adminError);
      return;
    }

    // Create regular user
    const { error: userError } = await supabase
      .from('users')
      .upsert([
        {
          employee_code: 'M1019',
          name: 'Medical Staff',
          role: 'Doctor',
        }
      ], { onConflict: 'employee_code' });

    if (userError) {
      console.error('Error creating regular user:', userError);
      return;
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}