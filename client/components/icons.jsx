import React from 'react'
import { SvgIcon } from '@mui/material'
import { styled } from '@mui/material/styles'
import Path from '/client/components/path.jsx'
import { mdiMenu, mdiAccountCircle, mdiApi, mdiGithub, mdiLogin, mdiLogout, mdiCog } from '@mdi/js'

export const Cog = styled(props => (
  <SvgIcon {...props}>
    <Path d={mdiCog} />
  </SvgIcon>
))({})

export const Login = styled(props => (
  <SvgIcon {...props}>
    <Path d={mdiLogin} />
  </SvgIcon>
))({})

export const Logout = styled(props => (
  <SvgIcon {...props}>
    <Path d={mdiLogout} />
  </SvgIcon>
))({})

export const Github = styled(props => (
  <SvgIcon {...props}>
    <Path d={mdiGithub} />
  </SvgIcon>
))({})

export const Menu = styled(props => (
  <SvgIcon {...props}>
    <Path d={mdiMenu} />
  </SvgIcon>
))({})

export const AccountCircle = styled(props => (
  <SvgIcon {...props}>
    <Path d={mdiAccountCircle} />
  </SvgIcon>
))({})

export const Api = styled(props => (
  <SvgIcon {...props}>
    <Path d={mdiApi} />
  </SvgIcon>
))({})
