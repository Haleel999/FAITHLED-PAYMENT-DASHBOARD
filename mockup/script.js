// Supabase loaded from CDN in index.html
const supabaseUrl = 'https://spzybhvzqnlyhulvewqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwenliaHZ6cW5seWh1bHZld3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDA5NzksImV4cCI6MjA3MDYxNjk3OX0.yxiun4aZkDqtWBo928ujTotbDx4I8QCJ8D0tcXb7KDM';


const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function testFetchStudents() {
  const { data, error } = await supabaseClient.from('*').select('*');
  if (error) {
    console.error('Error fetching students:', error.message);
  } else {
    console.log('Students:', data);
  }
}

testFetchStudents();