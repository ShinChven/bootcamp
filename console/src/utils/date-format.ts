import moment from "moment";

export const date = (inp?: moment.MomentInput): string => {
  return moment(inp).format('YYYY-MM-DD');
}

export const dateMinute = (inp?: moment.MomentInput): string => {
  return moment(inp).format('YYYY-MM-DD HH:mm');
}

export const dateTime = (inp?: moment.MomentInput): string => {
  return moment(inp).format('YYYY-MM-DD HH:mm:ss');
}

