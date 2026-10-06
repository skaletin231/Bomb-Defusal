import { Box, Pagination } from '@mui/material'

const PaginationComponent = ({ page, count, onChange }) => {
  if (count <= 1) return null

  return (
    <Box sx={{ justifyItems: 'center', marginTop: '30px' }}>
      <Pagination
        sx={{
          '& .MuiPaginationItem-root': {
            color: '#84582E',
            borderColor: '#84582E',
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            color: 'white',
            backgroundColor: '#84582E',
          },
          '& .MuiPaginationItem-root.Mui-selected:hover': {
            color: 'white',
            backgroundColor: '#84582E',
          },
          '& .MuiPaginationItem-root:hover': {
            color: 'white',
            backgroundColor: '#84582E',
          },
          '& .MuiPaginationItem-previousNext': {
            borderStyle: 'none',
          },
        }}
        page={page}
        count={count}
        variant='outlined'
        onChange={onChange}
      />
    </Box>
  )
}

export default PaginationComponent
