import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BudgetGraph = ({ data }) => {

    console.log(data)
    const chartData = {
        labels: ['Expenses', 'Earnings'],
        datasets: [
            {
                label: 'Amount',
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1,
                hoverBackgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)'],
                hoverBorderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                data: [data.expenses, data.earnings],
            },
        ],
    };

    const options = {
        scales: {
            x: { 
                beginAtZero: true,
            },
            y: { 
                beginAtZero: true,
                ticks: {
                    // This is where you configure the ticks for the y-axis
                },
            },
        },
    };

    return <Bar data={chartData} options={options} />;
};

export default BudgetGraph;
