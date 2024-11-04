import React from 'react'

const Update = ({ address, choice }) => {
    return (
        <div className='text-xs flex items-center gap-2 text-black my-4'>
            <img src={`${choice}-caret.png`} width={20} alt='choice' />
            ...{address.slice(15)} voted <b>{choice}</b>
        </div>
    )
}

export default Update