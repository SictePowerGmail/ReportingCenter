import React from 'react'
import '../powerbi.css'

function TorreControl() {

  return (
    <div className='powerbi'>
      <iframe
        title="Torre control"
        src="https://app.powerbi.com/view?r=eyJrIjoiOTAyZjVlYWQtNWVjYS00NGFlLWEzYzctMWJmYjU5YWQ3Zjk4IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9"
      ></iframe>
    </div>
  );
}

export default TorreControl;