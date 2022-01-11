import React, { useEffect, useState } from "react"
import BreadCrumb from "../../../components/breadcrumb"
import RefreshIcon from "../../../components/fundamentals/icons/refresh-icon"
import TrashIcon from "../../../components/fundamentals/icons/trash-icon"
import {
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "../../../components/table"
import Badge from "../../../components/badge"
import Medusa from "../../../services/api"
import EditUser from "./edit"
import DeletePrompt from "../../../components/organisms/delete-prompt"
import BodyCard from "../../../components/organisms/body-card"
import InviteModal from "../../../components/organisms/invite-modal"
import PlusIcon from "../../../components/fundamentals/icons/plus-icon"
import Actionables from "../../../components/molecules/actionables"
import EditIcon from "../../../components/fundamentals/icons/edit-icon"
import SidebarTeamMember from "../../../components/molecules/sidebar-team-member"
import useMedusa from "../../../hooks/use-medusa"

const Users = () => {
  const [users, setUsers] = useState([])
  const [invites, setInvites] = useState([])
  const [shouldRefetch, setShouldRefetch] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(false)
  const [selectedInvite, setSelectedInvite] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const { toaster } = useMedusa("store")
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(10)

  const handleClose = () => {
    setDeleteUser(false)
    setSelectedUser(null)
  }

  const triggerRefetch = () => {
    setShouldRefetch(prev => prev + 1)
  }

  useEffect(() => {
    Medusa.users
      .list()
      .then(res => res.data)
      .then(userData => {
        const users = [...userData.users]
        setUsers(users.map((user, i) => getUserTableRow(user, i)))
      })

    Medusa.invites
      .list()
      .then(res => res.data)
      .then(inviteData => {
        const invites = [...inviteData.invites]
        setInvites(invites.map((inv, i) => getInviteTableRow(inv, i)))
      })
  }, [shouldRefetch])

  const handlePagination = direction => {
    const updatedOffset = direction === "next" ? offset + limit : offset - limit
    setOffset(updatedOffset)
  }

  const actionables = [
    {
      label: "Invite Users",
      onClick: () => setShowInviteModal(true),
      icon: (
        <span className="text-grey-90">
          <PlusIcon size={20} />
        </span>
      ),
    },
  ]

  const getUserTableRow = (user, index) => {
    return (
      <TableRow key={index} color={"inherit"} fontWeight={550}>
        <TableDataCell>
          <SidebarTeamMember user={user} />
        </TableDataCell>
        <TableDataCell>{user.email}</TableDataCell>
        <TableDataCell>
          <Actionables
            actions={[
              {
                label: "Edit User",
                onClick: () => setSelectedUser(user),
                icon: <EditIcon size={20} />,
              },
              {
                label: "Remove User",
                variant: "danger",
                onClick: () => {
                  setDeleteUser(true)
                  setSelectedUser(user)
                },
                icon: <TrashIcon size={20} />,
              },
            ]}
          />
        </TableDataCell>
      </TableRow>
    )
  }

  const getInviteTableRow = (invite, index) => {
    return (
      <TableRow key={index}>
        <TableDataCell>-</TableDataCell>
        <TableDataCell>
          {invite.user_email}
          {new Date(invite?.expires_at) < new Date() && (
            <Badge bg="yellow">Expired</Badge>
          )}
        </TableDataCell>
        <TableDataCell className="w-8">
          <Actionables
            actions={[
              {
                label: "Resend Invitation",
                onClick: () => {
                  Medusa.invites.resend(invite.id).then(() => {
                    toaster("Invitiation link has been resent", "success")
                  })
                },
                icon: <RefreshIcon size={20} />,
              },
              {
                label: "Remove Invitation",
                variant: "danger",
                onClick: () => console.log("removing", invite.id),
                icon: <TrashIcon size={20} />,
              },
            ]}
          />
        </TableDataCell>
      </TableRow>
    )
  }

  return (
    <div className="w-full h-full">
      <BreadCrumb
        previousRoute="/a/settings"
        previousBreadCrumb="Settings"
        currentPage="The Team"
      />
      <BodyCard
        title="The Team"
        subtitle="Manage users of your Medusa Store"
        actionables={actionables}
      >
        <div className="w-full flex flex-col">
          <Table>
            <TableHead>
              <TableHeaderRow>
                <TableHeaderCell fontWeight={450}>Name</TableHeaderCell>
                <TableHeaderCell fontWeight={450}>Email</TableHeaderCell>
              </TableHeaderRow>
            </TableHead>
            <TableBody>
              {users}
              {invites}
            </TableBody>
          </Table>
          <div>
            <span className="inter-small-regular text-grey-50">
              {users.filter(usr => !usr.token).length} member
              {users.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        {selectedInvite && <></>}
        {selectedUser &&
          (deleteUser ? (
            <DeletePrompt
              text={"Are you sure you want to remove this user?"}
              heading={"Remove user"}
              onDelete={() =>
                Medusa.users
                  .delete(selectedUser.id)
                  .then(() => triggerRefetch())
              }
              handleClose={handleClose}
            />
          ) : (
            <EditUser
              handleClose={handleClose}
              user={selectedUser}
              onSubmit={triggerRefetch}
            />
          ))}
        {showInviteModal && (
          <InviteModal
            handleClose={() => {
              triggerRefetch()
              setShowInviteModal(false)
            }}
          />
        )}
      </BodyCard>
    </div>
  )
}

export default Users
